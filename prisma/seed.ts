/**
 * Datos iniciales de Hannah Store.
 *
 * Reproduce lo que muestra el canvas del diseno (productos, repartidores, pedidos
 * en sus distintos estados) para que la app se vea viva desde el primer arranque.
 * Es idempotente: se puede correr varias veces.
 */
import 'dotenv/config';
import { OrderStatus, PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: process.env.DATABASE_URL },
    { schema: process.env.DB_SCHEMA },
  ),
});

// La tienda entrega en una sola ciudad: una fila interna con el domicilio y la franja.
const ZONE = { number: 1, name: 'Barranquilla', deliveryFee: 8000, etaHoursMin: 24, etaHoursMax: 48 };

const CATEGORIES = [
  { name: 'Vestidos', slug: 'vestidos', position: 1 },
  { name: 'Blusas', slug: 'blusas', position: 2 },
  { name: 'Bisuteria', slug: 'bisuteria', position: 3 },
  { name: 'Faldas', slug: 'faldas', position: 4 },
];

const PRODUCTS = [
  {
    ref: 'HS-0412',
    name: 'Vestido Aurora',
    slug: 'vestido-aurora',
    category: 'vestidos',
    price: 189900,
    isFeatured: true,
    description:
      'Corte midi en satin con caida fluida. Forro interior y cierre invisible. Ideal para eventos de tarde.',
    variants: [
      { size: 'XS', color: 'Rosa', stock: 3 },
      { size: 'S', color: 'Rosa', stock: 1 },
      { size: 'M', color: 'Rosa', stock: 7 },
      { size: 'L', color: 'Rosa', stock: 5 },
    ],
  },
  {
    ref: 'HS-0388',
    name: 'Blusa Camelia',
    slug: 'blusa-camelia',
    category: 'blusas',
    price: 98000,
    description: 'Blusa de manga tres cuartos en gasa marfil, con botones forrados y puno elastico.',
    variants: [
      { size: 'S', color: 'Marfil', stock: 12 },
      { size: 'M', color: 'Marfil', stock: 9 },
    ],
  },
  {
    ref: 'HS-0501',
    name: 'Collar Solene',
    slug: 'collar-solene',
    category: 'bisuteria',
    price: 72500,
    description: 'Collar banado en oro de 18k con dije de perla cultivada. Cierre de mosqueton.',
    variants: [{ size: 'Unica', color: 'Dorado', stock: 24 }],
  },
  {
    ref: 'HS-0455',
    name: 'Falda Mila',
    slug: 'falda-mila',
    category: 'faldas',
    price: 129900,
    description: 'Falda envolvente en lino mezclado, largo midi y lazo lateral ajustable.',
    variants: [
      { size: 'S', color: 'Rosa', stock: 0 },
      { size: 'M', color: 'Rosa', stock: 3 },
    ],
  },
  {
    ref: 'HS-0377',
    name: 'Aretes Lumiere',
    slug: 'aretes-lumiere',
    category: 'bisuteria',
    price: 54900,
    isFeatured: true,
    description: 'Aretes largos banados en oro con cristales facetados. Ligeros para todo el dia.',
    variants: [{ size: 'Unica', color: 'Dorado', stock: 18 }],
  },
];

const COURIERS = [
  { name: 'Carlos Medina', phone: '+573105551001' },
  { name: 'Ana Gomez', phone: '+573105551002' },
  { name: 'Julian Torres', phone: '+573105551003' },
];

const SETTINGS = {
  whatsapp: '+57 310 555 0011',
  instagram: '@hannahstore',
  coverage: 'Barranquilla y alrededores - 24 a 48 h',
  hours: 'Respondemos de 9 a.m. a 7 p.m.',
  tagline: 'Moda que te representa - pago contra entrega',
  freeShippingFrom: '250000',
};

async function main() {
  console.log('Sembrando Hannah Store...');

  // Zona interna: la ciudad. No se elige en ningun sitio, solo guarda el domicilio.
  const zone = await prisma.zone.upsert({
    where: { number: ZONE.number },
    create: ZONE,
    update: { name: ZONE.name },
  });

  // Categorias
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }
  const categories = await prisma.category.findMany();

  // Catalogo
  for (const p of PRODUCTS) {
    const categoryId = categories.find((c) => c.slug === p.category)!.id;
    const product = await prisma.product.upsert({
      where: { ref: p.ref },
      create: {
        ref: p.ref,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        isFeatured: p.isFeatured ?? false,
        categoryId,
      },
      update: { price: p.price, description: p.description, categoryId },
    });

    for (const v of p.variants) {
      const sku = `${p.ref}-${v.size}-${v.color}`.toUpperCase();
      await prisma.variant.upsert({
        where: { sku },
        create: { productId: product.id, sku, ...v },
        update: { stock: v.stock },
      });
    }
  }

  // Cuentas: una administradora y una clienta recurrente
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hannahstore.co' },
    create: {
      name: 'Hannah Admin',
      email: 'admin@hannahstore.co',
      phone: '+573105550011',
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash('admin123', 10),
    },
    update: { role: Role.ADMIN },
  });

  const valentina = await prisma.user.upsert({
    where: { email: 'valentina@ejemplo.com' },
    create: {
      name: 'Valentina Rios',
      email: 'valentina@ejemplo.com',
      phone: '+573105554821',
      passwordHash: await bcrypt.hash('cliente123', 10),
    },
    update: {},
  });

  const hasAddress = await prisma.address.count({ where: { userId: valentina.id } });
  if (!hasAddress) {
    await prisma.address.create({
      data: {
        userId: valentina.id,
        line: 'Cra 13 #85-42, apto 502',
        neighborhood: 'El Prado',
        zoneId: zone.id,
        notes: 'Portería recibe hasta las 8 p.m.',
        isDefault: true,
      },
    });
  }

  // Repartidores
  for (const c of COURIERS) {
    const initials = c.name.split(' ').map((w) => w[0]).join('');
    await prisma.courier.upsert({
      where: { id: (await prisma.courier.findFirst({ where: { phone: c.phone } }))?.id ?? '-' },
      create: { name: c.name, initials, phone: c.phone },
      update: { name: c.name, initials },
    });
  }
  const couriers = await prisma.courier.findMany();
  const courierOf = (name: string) => couriers.find((c) => c.name.startsWith(name))!;

  // Ajustes de la tienda
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  // ── Pedidos de ejemplo ────────────────────────────────────
  // Solo se siembran una vez: si ya hay pedidos, se respeta lo que exista.
  if ((await prisma.order.count()) > 0) {
    console.log('Ya habia pedidos, no se vuelven a sembrar.');
    return done();
  }

  const variants = await prisma.variant.findMany({ include: { product: true } });
  const bySku = (sku: string) => variants.find((v) => v.sku === sku.toUpperCase())!;

  type SeedItem = { sku: string; qty: number };
  type SeedOrder = {
    code: string;
    customer: string;
    phone: string;
    userId?: string;
    line: string;
    neighborhood: string;
    status: OrderStatus;
    courier?: string;
    items: SeedItem[];
    hoursAgo: number;
    failureReason?: string;
  };

  const createOrder = async (o: SeedOrder) => {
    const createdAt = new Date(Date.now() - o.hoursAgo * 3600_000);
    const items = o.items.map(({ sku, qty }) => {
      const v = bySku(sku);
      return {
        variantId: v.id,
        productRef: v.product.ref,
        productName: v.product.name,
        size: v.size,
        color: v.color,
        unitPrice: v.product.price,
        quantity: qty,
        lineTotal: v.product.price * qty,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

    const events: { type: any; note: string; at: Date }[] = [
      { type: 'CONFIRMED', note: 'Pedido confirmado', at: createdAt },
    ];
    const courier = o.courier ? courierOf(o.courier) : null;
    if (o.status !== 'NUEVO' && courier) {
      events.push({
        type: 'PACKED',
        note: `Empacado y asignado a ${courier.name}`,
        at: new Date(createdAt.getTime() + 3600_000),
      });
    }
    if (['EN_RUTA', 'ENTREGADO_COBRADO', 'NO_RECIBIDO'].includes(o.status) && courier) {
      events.push({
        type: 'OUT_FOR_DELIVERY',
        note: `En ruta con ${courier.name}`,
        at: new Date(createdAt.getTime() + 7200_000),
      });
    }
    if (o.status === 'ENTREGADO_COBRADO') {
      events.push({
        type: 'DELIVERED_PAID',
        note: 'Entregado y pagado en efectivo',
        at: new Date(createdAt.getTime() + 10800_000),
      });
    }
    if (o.status === 'NO_RECIBIDO') {
      events.push({
        type: 'FAILED',
        note: o.failureReason ?? 'No recibido',
        at: new Date(createdAt.getTime() + 10800_000),
      });
    }

    const windowStart = new Date(createdAt);
    windowStart.setDate(windowStart.getDate() + 1);
    windowStart.setHours(14, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(17, 0, 0, 0);

    await prisma.order.create({
      data: {
        code: o.code,
        status: o.status,
        userId: o.userId ?? null,
        customerName: o.customer,
        customerPhone: o.phone,
        addressLine: o.line,
        neighborhood: o.neighborhood,
        zoneId: zone.id,
        courierId: courier?.id ?? null,
        subtotal,
        deliveryFee: zone.deliveryFee,
        total: subtotal + zone.deliveryFee,
        deliveryWindowStart: windowStart,
        deliveryWindowEnd: windowEnd,
        deliveredAt: o.status === 'ENTREGADO_COBRADO' ? new Date(createdAt.getTime() + 10800_000) : null,
        failureReason: o.failureReason ?? null,
        createdAt,
        items: { create: items },
        events: { create: events },
      },
    });
  };

  const ORDERS: SeedOrder[] = [
    {
      code: 'HS-2188',
      customer: 'Valentina Rios',
      phone: '+573105554821',
      userId: valentina.id,
      line: 'Cra 13 #85-42, apto 502',
      neighborhood: 'El Prado',
      status: 'DEVUELTO',
      courier: 'Carlos',
      items: [{ sku: 'HS-0388-S-MARFIL', qty: 1 }, { sku: 'HS-0501-UNICA-DORADO', qty: 1 }],
      hoursAgo: 27 * 24,
      failureReason: 'No recibido, devuelto a tienda',
    },
    {
      code: 'HS-2310',
      customer: 'Valentina Rios',
      phone: '+573105554821',
      userId: valentina.id,
      line: 'Cra 13 #85-42, apto 502',
      neighborhood: 'El Prado',
      status: 'ENTREGADO_COBRADO',
      courier: 'Ana',
      items: [{ sku: 'HS-0388-M-MARFIL', qty: 1 }],
      hoursAgo: 12 * 24,
    },
    {
      code: 'HS-2478',
      customer: 'Sofia Alvarez',
      phone: '+573125559034',
      line: 'Cl 40 Sur #78-11',
      neighborhood: 'La Concepcion',
      status: 'NO_RECIBIDO',
      courier: 'Julian',
      items: [{ sku: 'HS-0388-M-MARFIL', qty: 1 }],
      hoursAgo: 6,
      failureReason: 'Nadie contesto, se reintenta manana',
    },
    {
      code: 'HS-2479',
      customer: 'Daniela Mora',
      phone: '+573155552277',
      line: 'Cl 34 #16-08',
      neighborhood: 'Boston',
      status: 'ENTREGADO_COBRADO',
      courier: 'Ana',
      items: [{ sku: 'HS-0501-UNICA-DORADO', qty: 1 }, { sku: 'HS-0388-S-MARFIL', qty: 1 }],
      hoursAgo: 5,
    },
    {
      code: 'HS-2480',
      customer: 'Laura Pena',
      phone: '+573145558812',
      line: 'Cra 92 #146-30',
      neighborhood: 'Villa Country',
      status: 'NUEVO',
      items: [{ sku: 'HS-0388-S-MARFIL', qty: 1 }],
      hoursAgo: 4,
    },
    {
      code: 'HS-2481',
      customer: 'Valentina Rios',
      phone: '+573105554821',
      userId: valentina.id,
      line: 'Cra 13 #85-42, apto 502',
      neighborhood: 'El Prado',
      status: 'EN_RUTA',
      courier: 'Carlos',
      items: [{ sku: 'HS-0412-S-ROSA', qty: 1 }, { sku: 'HS-0377-UNICA-DORADO', qty: 2 }],
      hoursAgo: 3,
    },
  ];

  // Pedidos nuevos que todavia no tienen repartidor.
  const PENDING = [
    { name: 'Mariana Ochoa', phone: '+573001112233', line: 'Cra 100 #22-14', barrio: 'Alto Prado' },
    { name: 'Camila Duarte', phone: '+573002223344', line: 'Cl 145 #91-20', barrio: 'Villa Country' },
    { name: 'Isabella Nino', phone: '+573003334455', line: 'Cra 68 #40-15', barrio: 'Boston' },
    { name: 'Paula Restrepo', phone: '+573004445566', line: 'Cl 26 Sur #72-04', barrio: 'La Concepcion' },
    { name: 'Juliana Vargas', phone: '+573005556677', line: 'Cra 15 #93-60', barrio: 'El Prado' },
  ];
  PENDING.forEach((p, i) =>
    ORDERS.push({
      code: `HS-${2482 + i}`,
      customer: p.name,
      phone: p.phone,
      line: p.line,
      neighborhood: p.barrio,
      status: 'NUEVO',
      items: [{ sku: i % 2 ? 'HS-0455-M-ROSA' : 'HS-0412-M-ROSA', qty: 1 }],
      hoursAgo: 2 - i * 0.2,
    }),
  );

  for (const o of ORDERS) await createOrder(o);

  // Caja del dia: Ana ya entrego el efectivo, Carlos todavia lo lleva encima.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.cashClosure.createMany({
    data: [
      {
        courierId: courierOf('Carlos').id,
        date: today,
        deliveriesCount: 8,
        collectedAmount: 1204000,
        closed: false,
      },
      {
        courierId: courierOf('Ana').id,
        date: today,
        deliveriesCount: 11,
        collectedAmount: 1406400,
        closed: true,
        closedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  return done();
}

function done() {
  console.log('Listo. Admin: admin@hannahstore.co / admin123 - Clienta: valentina@ejemplo.com / cliente123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
