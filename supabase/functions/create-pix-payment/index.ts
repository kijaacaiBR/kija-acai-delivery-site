import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePixPaymentRequest {
  orderId: string;
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
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

    const { orderId, amount, description, customerEmail, customerName }: CreatePixPaymentRequest = await req.json();

    console.log("Creating PIX payment for order:", orderId);

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
    const enabled = settingsMap['payment_abacatepay_enabled'] === 'true';

    if (!enabled) {
      throw new Error("AbacatePay não está habilitado");
    }

    if (!apiKey) {
      throw new Error("API Key da AbacatePay não configurada");
    }

    // Criar cobrança na AbacatePay
    const paymentData = {
      amount: Math.round(amount * 100), // Converter para centavos
      description: description,
      due_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      customer: {
        email: customerEmail,
        name: customerName
      },
      methods: ["pix"]
    };

    console.log("Sending request to AbacatePay:", paymentData);

    const abacateResponse = await fetch("https://api.abacatepay.com/billing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!abacateResponse.ok) {
      const errorText = await abacateResponse.text();
      console.error("AbacatePay API error:", errorText);
      throw new Error(`Erro na API AbacatePay: ${abacateResponse.status} - ${errorText}`);
    }

    const abacateResult = await abacateResponse.json();
    console.log("AbacatePay response:", abacateResult);

    // Atualizar pedido com informações do pagamento PIX
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        abacate_bill_id: abacateResult.id,
        pix_payment_url: abacateResult.url,
        pix_qr_code: abacateResult.pix_code || abacateResult.url,
        payment_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: 'pending_payment'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new Error(`Erro ao atualizar pedido: ${updateError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      billId: abacateResult.id,
      pixUrl: abacateResult.url,
      pixCode: abacateResult.pix_code || abacateResult.url,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-pix-payment:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno do servidor",
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});