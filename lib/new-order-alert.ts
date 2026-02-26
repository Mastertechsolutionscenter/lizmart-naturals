// lib/new-order-alert.ts
import type { Order as DbOrder, OrderItem as DbOrderItem, Address as DbAddress } from "@/generated/prisma";
import nodemailer from "nodemailer";

const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL ?? process.env.FRONTEND_STORE_URL ?? "https://neocommerce.vercel.app";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "sales@glamarace.pro";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "mail.privateemail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: (process.env.SMTP_SECURE === "true") || false,
  auth: {
    user: process.env.SMTP_USER ?? FROM_EMAIL,
    pass: process.env.SMTP_PASSWORD ?? process.env.EMAIL_PASSWORD,
  },
});

type PrismaOrderShape = DbOrder & {
  items: DbOrderItem[];
  shippingAddress: DbAddress | null;
};

/**
 * sendOrderAlert
 * - email: recipient admin email (owner)
 * - order: the Prisma order object returned with include: { items: true, shippingAddress: true }
 */
export const sendOrderAlert = async (email: string, order: PrismaOrderShape) => {
  // Use shippingAddress as buyer info (fullName, email, phone)
  const shipping = order.shippingAddress;

  // Compute total price (prefer order.totalAmount if present)
  const totalStr = order.totalAmount ? String(order.totalAmount) : "0";

  // Build items HTML from order.items
  const orderItemsHtml = order.items
    .map((item) => {
      const title = item.productTitle ?? (item.merchandiseSnapshot ? String(item.merchandiseSnapshot) : "Product");
      const variant = item.variantTitle ?? "";
      const qty = item.quantity ?? 0;
      const price =
        item.unitPriceAmount != null ? String(item.unitPriceAmount) :
        item.lineTotalAmount != null ? String(item.lineTotalAmount) :
        "0";
      return `
        <li style="margin-bottom:12px; padding: 8px; border-radius:6px; background:#f7fafc;">
          <div style="font-size:15px; font-weight:600;">${title} ${variant ? `— ${variant}` : ""}</div>
          <div style="font-size:13px; color:#4b5563;">Quantity: ${qty} • Price: KES ${price}</div>
        </li>
      `;
    })
    .join("");

  // Shipping address (if available)
  const shippingHtml = shipping
    ? `<div style="margin-bottom:12px;">
         <strong>Shipping To:</strong><br/>
         ${shipping.fullName}<br/>
         ${shipping.phone}<br/>
         ${shipping.town}, ${shipping.county}
         ${shipping.email ? `<br/>${shipping.email}` : ""}
       </div>`
    : `<div style="margin-bottom:12px;"><strong>Shipping To:</strong> Not provided</div>`;

  // Buyer info using shipping address (fallback to "guest")
  const buyerName = shipping?.fullName ?? "Guest";
  const buyerEmail = shipping?.email ?? "no email";
  const buyerPhone = shipping?.phone ?? "no phone";

  // Order link — admin/dashboard
  const orderUrl = `${FRONTEND}/dashboard/admin/orders/${order.id}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111827;">
      <h2 style="margin-bottom:4px;">New paid order — ${order.orderNumber ?? order.id}</h2>
      <p>Order ID: <strong>${order.id}</strong></p>
      <p><strong>Total:</strong> KES ${totalStr}</p>
      ${shippingHtml}
      <h3 style="margin-top:12px;">Items</h3>
      <ul style="padding-left:0; list-style:none;">${orderItemsHtml}</ul>
      <p>
        <strong>Buyer:</strong> ${buyerName} (${buyerEmail}) — ${buyerPhone}
      </p>
      <p>
        View order: <a href="${orderUrl}">${orderUrl}</a>
      </p>
      <hr/>
      <p style="font-size:12px; color:#6b7280;">This is an automated notification.</p>
    </div>
  `;

  const mailOptions = {
    from: `Glamarace <${FROM_EMAIL}>`,
    to: email,
    subject: `New paid order ${order.orderNumber ?? order.id}`,
    html,
  };

  await transporter.sendMail(mailOptions);
};
