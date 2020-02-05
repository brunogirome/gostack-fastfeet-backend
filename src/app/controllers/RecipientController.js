import Recipient from '../models/Recipient';

class RecipientController {
  async show(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(401).json({ erro: 'Delivery does not exists' });
    }

    const {
      id,
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    } = recipient;

    return res.json({
      id,
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    });
  }

  async store(req, res) {
    const {
      id,
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    });
  }
}

export default new RecipientController();
