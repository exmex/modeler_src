class Integrations {
  integrationClassses = {};

  getIntegration(integrationName, ...params) {
    return new this.integrationClassses[integrationName](...params);
  }

  addIntegration(integrationName, integrationClass) {
    this.integrationClassses[integrationName] = integrationClass;
  }
}

const integrations = new Integrations();

function getIntegrations() {
  return integrations;
}

module.exports = getIntegrations;
