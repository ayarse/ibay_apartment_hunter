module.exports = {
  apps: [
    {
      name: 'ibay_apartment_hunter',
      script: 'src/app.ts',
      interpreter: 'node',
      interpreterArgs: '--import tsx',
    },
  ],
};
