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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.normalizePhone = normalizePhone;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
function normalizePhone(raw) {
    const digits = raw.replace(/\D/g, '');
    const local = digits.startsWith('57') && digits.length > 10 ? digits.slice(2) : digits;
    return `+57${local}`;
}
function normalizeEmail(raw) {
    return raw.trim().toLowerCase();
}
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(dto) {
        const email = normalizeEmail(dto.email);
        if (await this.prisma.user.findUnique({ where: { email } })) {
            throw new common_1.ConflictException('Ya existe una cuenta con ese correo');
        }
        const phone = dto.phone ? normalizePhone(dto.phone) : null;
        if (phone && (await this.prisma.user.findUnique({ where: { phone } }))) {
            throw new common_1.ConflictException('Ese teléfono ya está en otra cuenta');
        }
        const user = await this.prisma.user.create({
            data: {
                name: dto.name.trim(),
                email,
                phone,
                passwordHash: await bcrypt.hash(dto.password, 10),
            },
        });
        return this.sign(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: normalizeEmail(dto.email) },
        });
        if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Correo o contraseña incorrectos');
        }
        return this.sign(user);
    }
    async me(id) {
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
        return this.publicUser(user);
    }
    sign(user) {
        return { token: this.jwt.sign({ sub: user.id }), user: this.publicUser(user) };
    }
    publicUser(user) {
        return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map