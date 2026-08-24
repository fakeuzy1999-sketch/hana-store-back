"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema: process.env.DB_SCHEMA }),
});
const ZONES = [
    { number: 1, name: 'Centro', neighborhoods: ['Teusaquillo', 'Centro'] },
    { number: 2, name: 'Nororiente', neighborhoods: ['Chapinero', 'Usaquen'] },
    { number: 3, name: 'Occidente', neighborhoods: ['Fontibon'] },
    { number: 4, name: 'Noroccidente', neighborhoods: ['Suba'] },
    { number: 5, name: 'Suroccidente', neighborhoods: ['Kennedy'] },
];
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
        description: 'Corte midi en satin con caida fluida. Forro interior y cierre invisible. Ideal para eventos de tarde.',
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
    { name: 'Carlos Medina', phone: '+573105551001', zone: 2 },
    { name: 'Ana Gomez', phone: '+573105551002', zone: 1 },
    { name: 'Julian Torres', phone: '+573105551003', zone: 4 },
];
const SETTINGS = {
    whatsapp: '+57 310 555 0011',
    instagram: '@hannahstore',
    coverage: 'Bogota y alrededores - 24 a 48 h',
    hours: 'Respondemos de 9 a.m. a 7 p.m.',
    tagline: 'Moda que te representa - pago contra entrega',
    freeShippingFrom: '250000',
};
async function main() {
    console.log('Sembrando Hannah Store...');
    for (const z of ZONES) {
        await prisma.zone.upsert({
            where: { number: z.number },
            create: { ...z, deliveryFee: 8000, etaHoursMin: 24, etaHoursMax: 48 },
            update: { name: z.name, neighborhoods: z.neighborhoods },
        });
    }
    const zones = await prisma.zone.findMany();
    const zoneOf = (n) => zones.find((z) => z.number === n);
    for (const c of CATEGORIES) {
        await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
    }
    const categories = await prisma.category.findMany();
    for (const p of PRODUCTS) {
        const categoryId = categories.find((c) => c.slug === p.category).id;
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
    const admin = await prisma.user.upsert({
        where: { email: 'admin@hannahstore.co' },
        create: {
            name: 'Hannah Admin',
            email: 'admin@hannahstore.co',
            phone: '+573105550011',
            role: client_1.Role.ADMIN,
            passwordHash: await bcrypt.hash('admin123', 10),
        },
        update: { role: client_1.Role.ADMIN },
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
                neighborhood: 'Chapinero',
                zoneId: zoneOf(2).id,
                notes: 'Portería recibe hasta las 8 p.m.',
                isDefault: true,
            },
        });
    }
    for (const c of COURIERS) {
        const initials = c.name.split(' ').map((w) => w[0]).join('');
        await prisma.courier.upsert({
            where: { id: (await prisma.courier.findFirst({ where: { phone: c.phone } }))?.id ?? '-' },
            create: { name: c.name, initials, phone: c.phone, zoneId: zoneOf(c.zone).id },
            update: { name: c.name, initials, zoneId: zoneOf(c.zone).id },
        });
    }
    const couriers = await prisma.courier.findMany();
    const courierOf = (name) => couriers.find((c) => c.name.startsWith(name));
    for (const [key, value] of Object.entries(SETTINGS)) {
        await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    }
    if ((await prisma.order.count()) > 0) {
        console.log('Ya habia pedidos, no se vuelven a sembrar.');
        return done();
    }
    const variants = await prisma.variant.findMany({ include: { product: true } });
    const bySku = (sku) => variants.find((v) => v.sku === sku.toUpperCase());
    const createOrder = async (o) => {
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
        const zone = zoneOf(o.zone);
        const events = [
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
    const ORDERS = [
        {
            code: 'HS-2188',
            customer: 'Valentina Rios',
            phone: '+573105554821',
            userId: valentina.id,
            line: 'Cra 13 #85-42, apto 502',
            neighborhood: 'Chapinero',
            zone: 2,
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
            neighborhood: 'Chapinero',
            zone: 2,
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
            neighborhood: 'Kennedy',
            zone: 5,
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
            neighborhood: 'Teusaquillo',
            zone: 1,
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
            neighborhood: 'Suba',
            zone: 4,
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
            neighborhood: 'Chapinero',
            zone: 2,
            status: 'EN_RUTA',
            courier: 'Carlos',
            items: [{ sku: 'HS-0412-S-ROSA', qty: 1 }, { sku: 'HS-0377-UNICA-DORADO', qty: 2 }],
            hoursAgo: 3,
        },
    ];
    const PENDING = [
        { name: 'Mariana Ochoa', phone: '+573001112233', line: 'Cra 100 #22-14', barrio: 'Fontibon', zone: 3 },
        { name: 'Camila Duarte', phone: '+573002223344', line: 'Cl 145 #91-20', barrio: 'Suba', zone: 4 },
        { name: 'Isabella Nino', phone: '+573003334455', line: 'Cra 68 #40-15', barrio: 'Teusaquillo', zone: 1 },
        { name: 'Paula Restrepo', phone: '+573004445566', line: 'Cl 26 Sur #72-04', barrio: 'Kennedy', zone: 5 },
        { name: 'Juliana Vargas', phone: '+573005556677', line: 'Cra 15 #93-60', barrio: 'Chapinero', zone: 2 },
    ];
    PENDING.forEach((p, i) => ORDERS.push({
        code: `HS-${2482 + i}`,
        customer: p.name,
        phone: p.phone,
        line: p.line,
        neighborhood: p.barrio,
        zone: p.zone,
        status: 'NUEVO',
        items: [{ sku: i % 2 ? 'HS-0455-M-ROSA' : 'HS-0412-M-ROSA', qty: 1 }],
        hoursAgo: 2 - i * 0.2,
    }));
    for (const o of ORDERS)
        await createOrder(o);
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
//# sourceMappingURL=seed.js.map