import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class WithdrawController {
  async index(req, res) {
    const { deliveryman_id, page = 1 } = req.query;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Invalid deliveryman id' });
    }

    const deliveries = await Delivery.findAll({
      order: ['created_at'],
      attributes: ['id', 'product'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'recipient_name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
      where: {
        deliveryman_id,
        canceled_at: null,
        end_date: null,
        start_date: null,
      },
    });

    return res.json(deliveries);
  }
}
export default new WithdrawController();
