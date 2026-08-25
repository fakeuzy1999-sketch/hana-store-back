import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Ciudad unica de la tienda. Da nombre a la zona interna y a lo que ve la clienta. */
export const CITY = 'Barranquilla';

const DEFAULTS = {
  number: 1,
  name: CITY,
  neighborhoods: [] as string[],
  deliveryFee: 8000,
  etaHoursMin: 24,
  etaHoursMax: 48,
  active: true,
};

/** Cliente de Prisma normal o el de dentro de una transaccion. */
type Db = PrismaService | Prisma.TransactionClient;

/**
 * La tienda entrega en una sola ciudad, asi que no hay zonas que elegir: el
 * domicilio y la franja de entrega son unos para todos los pedidos.
 *
 * La tabla `zones` sigue existiendo porque `Order.zoneId` y `Address.zoneId` son
 * obligatorios y los pedidos historicos apuntan ahi; se reduce a **una sola fila
 * interna** que nadie ve ni elige y que guarda esos dos numeros. Asi se evita
 * migrar la base de produccion para quitar una columna que ya no molesta.
 */
@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * La zona interna, creandola si la base esta limpia. Se pasa el cliente de la
   * transaccion cuando se llama desde dentro de una (crear pedido), para que la
   * fila exista dentro del mismo `$transaction`.
   */
  zone(db: Db = this.prisma) {
    return db.zone.upsert({
      where: { number: DEFAULTS.number },
      create: DEFAULTS,
      update: {},
    });
  }

  /** Lo que el resto de la tienda necesita saber de la entrega. */
  async terms() {
    const zone = await this.zone();
    return {
      city: CITY,
      deliveryFee: zone.deliveryFee,
      etaHoursMin: zone.etaHoursMin,
      etaHoursMax: zone.etaHoursMax,
    };
  }

  async update(values: { deliveryFee?: number; etaHoursMin?: number; etaHoursMax?: number }) {
    const zone = await this.zone();
    const data = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined));
    if (!Object.keys(data).length) return this.terms();
    await this.prisma.zone.update({ where: { id: zone.id }, data });
    return this.terms();
  }
}
