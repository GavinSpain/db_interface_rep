"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const heartbeatstatus_controller_1 = require("../controllers/heartbeatstatus.controller");
const router = (0, express_1.Router)();
const controller = new heartbeatstatus_controller_1.HeartbeatStatusController();
router.get('/', controller.getStatus);
exports.default = router;
