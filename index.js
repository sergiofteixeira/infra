"use strict";
const pulumi = require("@pulumi/pulumi");
const grafana = require("@lbrlabs/pulumi-grafana");
const fs = require("fs");
const cloudflare = require("@pulumi/cloudflare");

const config = new pulumi.Config();
const zoneId = config.require("zone_id");
const dnsMap = new Map([
    ['grafana', '192.168.1.80'],
]);

const prometheusDataSource = new grafana.DataSource("prometheus", {
    type: "prometheus",
    url: "https://prometheus.nathil.com",
    basicAuthEnabled: false,
    accessMode: "proxy",
    isDefault: true,
    name: "prometheus",
    uid: "1"
})

const infraFolder  = new grafana.Folder("infra", {
    title: "infra"
} )

const nodeExporterDashboards = new grafana.Dashboard("metrics", {
    configJson: JSON.stringify(JSON.parse(fs.readFileSync("dashboards/node-exporter.json", 'utf8')),null, 2),
    folder: infraFolder.id,
    orgId: "1",
    overwrite: true
})

for (const [domain, ip] of dnsMap) {
    new cloudflare.Record(domain, {
        name: domain,
        zoneId: zoneId,
        type: "A",
        value: ip,
        ttl: 3600
    })
}
