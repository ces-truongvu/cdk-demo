import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack, TerraformVariable } from "cdktf";
import { HcloudProvider } from "./.gen/providers/hcloud/provider";
import { Server } from "./.gen/providers/hcloud/server";
import { SshKey } from "./.gen/providers/hcloud/ssh-key";
import * as Config from "./config";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const token = new TerraformVariable(this, "HCLOUD_TOKEN", {
      sensitive: true,
    });

    const publicKey = new TerraformVariable(this, "PUBLIC_KEY", {
      sensitive: true,
    });

    new HcloudProvider(this, "hcloud", {
      token: token.value,
    });

    const sshKey = new SshKey(this, "demo-sshkey", {
      name: "demo-sshkey",
      publicKey: publicKey.value,
    });

    const server = new Server(this, "demo-server", {
      name: "demo-server",
      serverType: Config.ServerType.cpx21,
      image: Config.OS.Ubuntu22,
      location: Config.Location.USWest,
      sshKeys: [sshKey.id],
    });

    new TerraformOutput(this, "demo-server-output", {
      value: `
      Server Name: ${server.name}
      Server IP: ${server.ipv4Address}
      `,
    });
  }
}

const app = new App();
new MyStack(app, "demo");
app.synth();
