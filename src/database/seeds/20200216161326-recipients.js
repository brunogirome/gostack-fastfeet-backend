module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'recipients',
      [
        {
          recipient_name: 'Hagata Faria',
          street: 'Rua Fagundes Segundo',
          number: 11,
          complement: '',
          state: 'São Paulo',
          city: 'São Paulo',
          zip_code: '08932010',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          recipient_name: 'Lucio Augusto',
          street: 'Rua Presdente Almeida',
          number: 1,
          complement: 'Apartamento',
          state: 'São Paulo',
          city: 'Jundiaí',
          zip_code: '08934010',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          recipient_name: 'Ana Soares',
          street: 'Avenida Baixada Silva',
          number: 20,
          complement: '',
          state: 'São Paulo',
          city: 'Guarulhos',
          zip_code: '15934020',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
