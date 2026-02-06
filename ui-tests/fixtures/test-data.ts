export const Users = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
  error: {
    username: 'error_user',
    password: 'secret_sauce',
  },
  visual: {
    username: 'visual_user',
    password: 'secret_sauce',
  },
} as const;

export const Products = {
  backpack: {
    name: 'Sauce Labs Backpack',
    price: 29.99,
    slug: 'sauce-labs-backpack',
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    slug: 'sauce-labs-bike-light',
  },
  onesie: {
    name: 'Sauce Labs Onesie',
    price: 7.99,
    slug: 'sauce-labs-onesie',
  },
  fleeceJacket: {
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    slug: 'sauce-labs-fleece-jacket',
  },
} as const;

export const CheckoutInfo = {
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345',
} as const;

export const ErrorMessages = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
} as const;
