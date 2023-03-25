const express = require("express");
const clientControllers = require("../controllers/client-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.post("/session/:cid", clientControllers.addClientSession);

router.post("/:cid", clientControllers.addClient);

router.get("/:cid", clientControllers.getClientSessions);

router.delete("/:sid", clientControllers.deleteClientSession);

module.exports = router;
