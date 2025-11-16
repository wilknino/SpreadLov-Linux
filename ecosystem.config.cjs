module.exports = {
  apps: [
    {
      name: "spreadlov",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        DATABASE_URL: "postgresql://spreadlovuser:T=[ab!Bu5H{gV.ZN@127.0.0.1:5432/spreadlovdb",
        SESSION_SECRET: "a0ccde836d28fc187ef2c6ac7c188c21ddf518fab8df07de244453abc8dfcdd5"
      }
    }
  ]
};
