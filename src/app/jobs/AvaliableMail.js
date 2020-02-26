import Mail from '../../lib/Mail';

class AvaliableMail {
  // Chave únca do job
  get key() {
    return 'AvaliableMail';
  }

  async handle({ data }) {
    const { delivery, recipient, deliveryman } = data;

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
  }
}

export default new AvaliableMail();
