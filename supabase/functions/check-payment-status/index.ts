import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckPaymentRequest {
  orderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { orderId }: CheckPaymentRequest = await req.json();

    console.log("Checking payment status for order:", orderId);

    // Buscar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Pedido não encontrado");
    }

    if (!order.abacate_bill_id) {
      throw new Error("Pedido não possui bill_id da AbacatePay");
    }

    // Buscar configurações da AbacatePay
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .like('key', 'payment_abacatepay_%');

    if (settingsError) {
      throw new Error(`Erro ao buscar configurações: ${settingsError.message}`);
    }

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const apiKey = settingsMap['payment_abacatepay_api_key'] || Deno.env.get("ABACATEPAY_API_KEY");

    if (!apiKey) {
      throw new Error("API Key da AbacatePay não configurada");
    }

    // Consultar status na AbacatePay
    const abacateResponse = await fetch(`https://api.abacatepay.com/billing/get/${order.abacate_bill_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!abacateResponse.ok) {
      const errorText = await abacateResponse.text();
      console.error("AbacatePay API error:", errorText);
      throw new Error(`Erro na API AbacatePay: ${abacateResponse.status}`);
    }

    const abacateResult = await abacateResponse.json();
    console.log("AbacatePay status response:", abacateResult);

    let newStatus = order.status;
    let statusChanged = false;

    // Mapear status da AbacatePay para o nosso sistema
    switch (abacateResult.status?.toLowerCase()) {
      case "paid":
        if (order.status !== "confirmed") {
          newStatus = "confirmed";
          statusChanged = true;
        }
        break;
      case "canceled":
      case "expired":
        if (order.status !== "cancelled") {
          newStatus = "cancelled";
          statusChanged = true;
        }
        break;
      case "pending":
        // Verificar se expirou
        const expiresAt = new Date(order.payment_expires_at);
        if (expiresAt < new Date() && order.status !== "cancelled") {
          newStatus = "cancelled";
          statusChanged = true;
        }
        break;
    }

    // Atualizar status se necessário
    if (statusChanged) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error("Error updating order status:", updateError);
        throw new Error(`Erro ao atualizar status do pedido: ${updateError.message}`);
      }

      console.log(`Order ${orderId} status updated from ${order.status} to ${newStatus}`);
    }

    return new Response(JSON.stringify({
      success: true,
      status: newStatus,
      previousStatus: order.status,
      statusChanged,
      abacateStatus: abacateResult.status,
      expiresAt: order.payment_expires_at
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in check-payment-status:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno do servidor",
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});