"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_orders_service_1 = require("./admin-orders.service");
const admin_products_service_1 = require("./admin-products.service");
const admin_reports_service_1 = require("./admin-reports.service");
const admin_routes_service_1 = require("./admin-routes.service");
const orders_module_1 = require("../orders/orders.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_orders_service_1.AdminOrdersService, admin_products_service_1.AdminProductsService, admin_reports_service_1.AdminReportsService, admin_routes_service_1.AdminRoutesService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map