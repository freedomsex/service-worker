import _ from 'underscore';
// import importModules from 'import-modules';

export default class Worker {
  constructor(config) {
    // super();
    this.$api = {};
    this.$store = {};
    this.$session = {};
    this.$modules = {};
    this.$cache = {};
    this.$sse = {};
    this.tasks = config.tasks || {};
    // this.$modules = config.modules;
    this.autoLoad(config);
    this.loadModules(config.modules);
    // this.created();
  }
  
  autoLoad({directory, options}) {
    // const modules = importModules(directory, options);
    // this.loadModules(modules);
  }

  addService(service, namespace) {
    this.$modules[namespace] = service;
  }

  loadModules(modules) {
    _.each(modules, (service, namespace) => {
      this.addService(service, namespace);
    });
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

  sse(sse) {
    if (sse) {
      this.$sse = sse;
    }
    return this.$sse;
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

  session(key) {
    this.$session[key] = true;
  }

  context() {
    return {
      run: this.run.bind(this),
      api: this.$api,
      store: this.$store,
      cache: this.$cache,
      sse: this.$sse,
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
    if (module) {
      const target = module.tasks[task];
      return this.runTask(module, target, args);
    } else {
      console.error('No module found named: ' + name);
    }
  }

  run(task, args) {
    if (this.isModule(task)) {
      return this.runModule(task, args);
    }
    const target = this.tasks[task];
    return this.runTask(this, target, args);
  }
}
