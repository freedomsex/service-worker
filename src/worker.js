import _ from 'underscore';

export default class Worker {
  constructor(config) {
    // super();
    this.$api = {};
    this.$store = {};
    this.$session = {};
    this.$modules = {};
    this.$cache = {};
    this.tasks = config.tasks || {};
    // this.$modules = config.modules;
    this.loadModules(config.modules);
    // this.created();
  }

  api(api) {
    if (api) {
      this.$api = api;
    }
    return this.$api;
  }

  store(store) {
    if (store) {
      this.$store = store;
    }
    return this.$store;
  }

  cache(cache) {
    if (cache) {
      this.$cache = cache;
    }
    return this.$cache;
  } 

  moduleInfo(name) {
    const parts = name.split('/');
    const task = parts.pop();
    const namespace = parts.join('/');
    return {namespace, task};
  }

  loadModules(modules) {
    _.each(modules, (module, namespace) => {
      this.$modules[namespace] = module;
    });
  }

  session(key) {
    this.$session[key] = true;
  }

  context() {
    return {
      run: this.run,
      api: this.$api,
      store: this.$store,
      cache: this.$cache,
      root: this,
    };
  }

  isModule(name) {
    return name.indexOf('/') >= 0;
  }

  runTask(object, task, args) {
    return task.call(object, this.context(), args);
  }

  runModule(name, args) {
    const {namespace, task} = this.moduleInfo(name);
    const module = this.$modules[namespace];
    const target = module.tasks[task];
    return this.runTask(module, target, args);
  }

  run(task, args) {
    if (this.isModule(task)) {
      return this.runModule(task, args);
    }
    const target = this.tasks[task];
    return this.runTask(this, target, args);
  }
}
