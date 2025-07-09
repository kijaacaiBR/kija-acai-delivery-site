import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  order_id: string;
  customer_email: string;
  customer_name: string;
  status: string;
  note?: string;
  order_details: {
    total: number;
    items: Array<{
      product_name: string;
      quantity: number;
      product_price: number;
    }>;
  };
}

const getStatusMessage = (status: string) => {
  const messages = {
    pending: {
      subject: "Pedido Recebido - Kija Açaí",
      message: "Seu pedido foi recebido e está sendo processado."
    },
    confirmed: {
      subject: "Pedido Confirmado - Kija Açaí", 
      message: "Seu pedido foi confirmado e será preparado em breve."
    },
    preparing: {
      subject: "Preparando seu Açaí - Kija Açaí",
      message: "Seu açaí está sendo preparado com muito carinho!"
    },
    ready: {
      subject: "Pedido Pronto! - Kija Açaí",
      message: "Seu pedido está pronto para retirada ou será enviado para entrega."
    },
    delivered: {
      subject: "Pedido Entregue - Kija Açaí",
      message: "Seu pedido foi entregue com sucesso! Obrigado pela preferência."
    },
    cancelled: {
      subject: "Pedido Cancelado - Kija Açaí",
      message: "Seu pedido foi cancelado. Se você tem dúvidas, entre em contato conosco."
    }
  };
  
  return messages[status as keyof typeof messages] || {
    subject: "Atualização do Pedido - Kija Açaí",
    message: "Houve uma atualização no seu pedido."
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      order_id,
      customer_email,
      customer_name,
      status,
      note,
      order_details
    }: OrderNotificationRequest = await req.json();

    const statusInfo = getStatusMessage(status);
    
    // Generate items list HTML
    const itemsHTML = order_details.items.map(item => 
      `<li style="margin-bottom: 10px;">
        <strong>${item.product_name}</strong><br>
        Quantidade: ${item.quantity} × R$ ${item.product_price.toFixed(2).replace('.', ',')}
       </li>`
    ).join('');

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .order-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .status-badge { 
              display: inline-block; 
              padding: 5px 15px; 
              background: #8B5CF6; 
              color: white; 
              border-radius: 20px; 
              font-weight: bold; 
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍇 Kija Açaí</h1>
              <h2>${statusInfo.subject}</h2>
            </div>
            
            <div class="content">
              <p>Olá <strong>${customer_name}</strong>,</p>
              
              <p>${statusInfo.message}</p>
              
              <div class="status-badge">Status: ${status.toUpperCase()}</div>
              
              ${note ? `<div style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin: 15px 0;">
                <strong>Observação:</strong> ${note}
              </div>` : ''}
              
              <div class="order-details">
                <h3>Detalhes do Pedido #${order_id.slice(0, 8).toUpperCase()}</h3>
                
                <h4>Itens:</h4>
                <ul style="list-style-type: none; padding: 0;">
                  ${itemsHTML}
                </ul>
                
                <hr style="margin: 15px 0;">
                <p style="text-align: right; font-size: 18px; font-weight: bold;">
                  Total: R$ ${order_details.total.toFixed(2).replace('.', ',')}
                </p>
              </div>
              
              <p>Qualquer dúvida, entre em contato conosco pelo WhatsApp ou email.</p>
              
              <p>Obrigado pela preferência!</p>
              <p><strong>Equipe Kija Açaí</strong></p>
            </div>
            
            <div class="footer">
              <p>Este é um email automático, não responda diretamente.</p>
              <p>© 2024 Kija Açaí - O melhor açaí artesanal da cidade</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Kija Açaí <noreply@kija-acai.com>",
      to: [customer_email],
      subject: statusInfo.subject,
      html: emailHTML,
    });

    console.log("Order notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);