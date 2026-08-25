import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryService } from './delivery.service';

/** Datos de contacto, cobertura y condiciones de entrega que muestra la tienda. */
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly delivery: DeliveryService,
  ) {}

  /**
   * Los textos libres van tal cual; el domicilio y la franja se anaden desde la
   * entrega para que la tienda nunca tenga que inventarse el precio del envio.
   */
  async all(): Promise<Record<string, string>> {
    const [rows, terms] = await Promise.all([this.prisma.setting.findMany(), this.delivery.terms()]);
    return {
      ...Object.fromEntries(rows.map((r) => [r.key, r.value])),
      city: terms.city,
      deliveryFee: String(terms.deliveryFee),
      etaHoursMin: String(terms.etaHoursMin),
      etaHoursMax: String(terms.etaHoursMax),
    };
  }

  async set(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}
