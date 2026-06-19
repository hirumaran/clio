const router = require('express').Router()
const rateLimit = require('express-rate-limit')
const { authenticateToken } = require('../middleware/auth')
const { idempotency } = require('../middleware/idempotency')
const controller = require('../controllers/request.controller')

// ALL routes protected — no public access to borrow request data
router.use(authenticateToken)

// Per-account throttle on the sensitive create flow (each create enqueues
// notification/room jobs) — keyed by user id, not IP, since the route is authed.
const createRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => String(req.user?.userId ?? req.ip),
  message: { error: 'Too many borrow requests, try again later' },
})

// idempotency guards the non-idempotent mutations: a double-tap / retried Idempotency-Key
// replays the stored response instead of duplicating writes (no-op when the header is absent).
router.post   ('/',              createRequestLimiter, idempotency, controller.createRequest)
router.get    ('/incoming',      controller.getIncomingRequests)
router.get    ('/outgoing',      controller.getOutgoingRequests)
// Server-authoritative check used by the chat client before auto-joining a
// Matrix invite: confirms the room belongs to a borrow the caller is party to.
router.get    ('/room-authorized', controller.isBorrowRoomMember)
router.get    ('/:id',           controller.getRequestById)
router.patch  ('/:id/approve',   idempotency, controller.approveRequest)
router.patch  ('/:id/reject',    idempotency, controller.rejectRequest)
router.patch  ('/:id/cancel',    idempotency, controller.cancelRequest)
router.patch  ('/:id/pickup',    idempotency, controller.pickupItem)
router.patch  ('/:id/return',    idempotency, controller.returnItem)
router.patch  ('/:id/room',      controller.setRequestRoom)
router.post   ('/:id/room/retry', controller.retryRoomSetup)

module.exports = router
