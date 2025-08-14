import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  event: string;
  data: {
    id: string;
    status: string;
    amount: number;
    description: string;
    due_date: string;
    customer: {
      email: string;
      name: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const payload: WebhookPayload = await req.json();
    console.log("Received webhook from AbacatePay:", payload);

    const { event, data } = payload;

    if (event !== "bill.paid" && event !== "bill.canceled") {
      console.log("Ignoring webhook event:", event);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Buscar pedido pelo bill_id
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('abacate_bill_id', data.id)
      .limit(1);

    if (findError) {
      console.error("Error finding order:", findError);
      throw new Error(`Erro ao buscar pedido: ${findError.message}`);
    }

    if (!orders || orders.length === 0) {
      console.log("Order not found for bill_id:", data.id);
      return new Response("Order not found", { status: 404, headers: corsHeaders });
    }

    const order = orders[0];
    let newStatus: string;

    switch (event) {
      case "bill.paid":
        newStatus = "confirmed";
        console.log("Payment confirmed for order:", order.id);
        break;
      case "bill.canceled":
        newStatus = "cancelled";
        console.log("Payment canceled for order:", order.id);
        break;
      default:
        console.log("Unknown event:", event);
        return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Atualizar status do pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error("Error updating order status:", updateError);
      throw new Error(`Erro ao atualizar status do pedido: ${updateError.message}`);
    }

    // Enviar notificação por email/SMS se necessário
    if (newStatus === "confirmed") {
      try {
        await supabase.functions.invoke('send-order-notification', {
          body: {
            orderId: order.id,
            customerEmail: order.customer_email,
            customerName: order.customer_name,
            type: 'payment_confirmed'
          }
        });
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Não falhar o webhook por causa da notificação
      }
    }

    console.log(`Order ${order.id} status updated to ${newStatus}`);

    return new Response("OK", { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in abacatepay-webhook:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno do servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});