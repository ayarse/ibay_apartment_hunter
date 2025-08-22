module.exports = {
  apps: [
    {
      name: "ibay_apartment_hunter",
      script: "src/index.ts",
      interpreter: "node",
      interpreterArgs: "--import tsx",
    },
  ],
};
