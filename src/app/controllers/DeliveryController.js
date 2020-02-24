import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import Mail from '../../lib/Mail';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.validate(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.create(req.body);

    await Mail.sendMail({
      to: `${recipient.recipient_name} <${deliveryman.email}>`,
      subject: 'New delivery avalible',
      template: 'new-delivery',
      context: {
        deliveryman: deliveryman.name,
        product: delivery.product,
        recipient: recipient.recipientName,
        street: recipient.street,
        number: recipient.number,
        complement: recipient.complement,
        city: recipient.city,
        state: recipient.state,
        zipCode: recipient.zipCode,
        id: delivery.id,
      },
    });

    return res.json(delivery);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      order: ['created_at'],
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'withdrawable',
      ],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['recipient_name', 'state', 'city', 'zip_code'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
          include: [
            { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number(),
      product: Yup.string(),
      end_date: Yup.date(),
    });
  }
}

export default new DeliveryController();
