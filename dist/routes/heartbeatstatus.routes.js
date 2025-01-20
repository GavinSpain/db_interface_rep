"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const heartbeat_controller_1 = require("../controllers/heartbeat.controller");
const router = (0, express_1.Router)();
const controller = new heartbeat_controller_1.HeartbeatController();
router.get('/', controller.getTimeSince);
exports.default = router;
