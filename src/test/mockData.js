
export const addressNew = {
  associate: 'customer',
  city: 'Welland',
  country: null,
  countryCode: 'CA',
  postalCode: 'L3C 5Y2',
  provinceCode: 'ON',
  street1: '47 Northgate Dr.',
  street2: null,
  type: 'res',
}

export const addressUpdate = {
  _id: '5c79a6cf443cf0c5c4505e88',
  associate: 'customer',
  city: 'Welland',
  country: null,
  countryCode: 'CA',
  postalCode: 'L3C 5Y2',
  provinceCode: 'ON',
  street1: '456 Street Ave..',
  street2: null,
  type: 'res',
}

export const customerNew = {
  active: true,
  email: 'test@webbtech.net',
  name: {
    first: 'Test ',
    last: 'Dummy',
    spouse: 'Kimberly',
  },
  phones: [
    {
      _id: 'home',
      countryCode: '1',
      number: '(905) 687-0000',
    },
    {
      _id: 'mobile',
      countryCode: '1',
      number: '(905) 984-9000',
    },
  ],
}

export const customerUpdate = {
  _id: '5c79a6ce443cf0c5c4505e87',
  active: true,
  email: 'update@webbtech.net',
  name: {
    first: 'Test ',
    last: 'Dummy',
    spouse: 'Kimberly',
  },
  phones: [
    {
      _id: 'home',
      countryCode: '1',
      number: '(905) 687-0000',
    },
    {
      _id: 'mobile',
      countryCode: '1',
      number: '(905) 984-9000',
    },
  ],
}
