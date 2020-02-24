import { Op } from 'sequelize';
import * as Yup from 'yup';
import { parseISO, isBefore, format } from 'date-fns';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveredController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { id: deliveryman_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Delivery.findAll({
      order: ['created_at'],
      attributes: ['id', 'product', 'start_date', 'end_date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['recipient_name', 'state', 'city', 'zip_code'],
        },
      ],
      where: { deliveryman_id, end_date: { [Op.not]: null } },
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryman_id, delivery_id } = req.params;

    const delivery = await Delivery.findOne({
      where: { id: delivery_id, deliveryman_id },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Invalid delivery id' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Delivery canceled' });
    }

    if (delivery.end_date) {
      return res.status(400).json({ error: 'Delivery already endend' });
    }

    if (!delivery.start_date) {
      return res
        .status(400)
        .json({ error: 'Delivery has not yet been withdraw' });
    }

    const { signature_id } = req.body;

    const signature = await File.findByPk(signature_id);

    if (!signature) {
      return res.status(400).json({ error: 'Invalid recipient signature' });
    }

    const end_date = new Date();

    const start_date = format(delivery.start_date, "yyyy-MM-dd'T'HH:mm:ssxxx");

    if (isBefore(end_date, parseISO(start_date))) {
      return res.status(400).json({ error: 'Invalid end date' });
    }

    await delivery.update({ end_date, signature_id });

    return res.json(delivery);
  }
}

export default new DeliveredController();
