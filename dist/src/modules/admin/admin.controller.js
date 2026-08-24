"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_orders_service_1 = require("./admin-orders.service");
const admin_products_service_1 = require("./admin-products.service");
const admin_reports_service_1 = require("./admin-reports.service");
const admin_routes_service_1 = require("./admin-routes.service");
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    orders;
    products;
    reports;
    routes;
    constructor(orders, products, reports, routes) {
        this.orders = orders;
        this.products = products;
        this.reports = reports;
        this.routes = routes;
    }
    dashboard() {
        return this.reports.dashboard();
    }
    listOrders(filter) {
        return this.orders.list(filter);
    }
    orderDetail(code) {
        return this.orders.detail(code);
    }
    changeStatus(code, dto) {
        return this.orders.changeStatus(code, dto);
    }
    assign(code, dto) {
        return this.orders.assign(code, dto);
    }
    bulkAssign(dto) {
        return this.orders.bulkAssign(dto);
    }
    listProducts(filter) {
        return this.products.list(filter);
    }
    createProduct(dto) {
        return this.products.create(dto);
    }
    updateProduct(id, dto) {
        return this.products.update(id, dto);
    }
    toggleHidden(id) {
        return this.products.toggleHidden(id);
    }
    removeProduct(id) {
        return this.products.remove(id);
    }
    setStock(id, dto) {
        return this.products.setStock(id, dto);
    }
    cod(query) {
        return this.reports.cod(query.range ?? 'today');
    }
    codCsv(query) {
        return this.reports.codCsv(query.range ?? 'today');
    }
    couriers() {
        return this.routes.couriers();
    }
    createCourier(dto) {
        return this.routes.create(dto);
    }
    updateCourier(id, dto) {
        return this.routes.update(id, dto);
    }
    routesToday() {
        return this.routes.today();
    }
    closeCash(id) {
        return this.routes.closeCash(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.OrderFilterDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listOrders", null);
__decorate([
    (0, common_1.Get)('orders/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "orderDetail", null);
__decorate([
    (0, common_1.Patch)('orders/:code/status'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.ChangeStatusDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Patch)('orders/:code/courier'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.AssignCourierDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('orders/bulk-assign'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.BulkAssignDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('filter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.ProductDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.ProductDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)('products/:id/hidden'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleHidden", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "removeProduct", null);
__decorate([
    (0, common_1.Patch)('variants/:id/stock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.StockDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "setStock", null);
__decorate([
    (0, common_1.Get)('reports/cod'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "cod", null);
__decorate([
    (0, common_1.Get)('reports/cod.csv'),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="cobros.csv"'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "codCsv", null);
__decorate([
    (0, common_1.Get)('couriers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "couriers", null);
__decorate([
    (0, common_1.Post)('couriers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CourierDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCourier", null);
__decorate([
    (0, common_1.Put)('couriers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.CourierDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCourier", null);
__decorate([
    (0, common_1.Get)('routes/today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "routesToday", null);
__decorate([
    (0, common_1.Post)('closures/:id/close'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "closeCash", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:paramtypes", [admin_orders_service_1.AdminOrdersService,
        admin_products_service_1.AdminProductsService,
        admin_reports_service_1.AdminReportsService,
        admin_routes_service_1.AdminRoutesService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map