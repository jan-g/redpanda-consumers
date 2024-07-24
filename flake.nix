{
  description = "Example kickstart Node.js backend project.";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = inputs @ {flake-parts, ...}:
    flake-parts.lib.mkFlake {inherit inputs;} {
      systems = ["x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin"];

      perSystem = {
        config,
        self',
        inputs',
        pkgs,
        system,
        ...
      }:let 
      corepackEnable = pkgs.runCommand "corepack-enable" {} ''
          mkdir -p $out/bin
          ${pkgs.nodejs_20}/bin/corepack enable --install-directory $out/bin
        '';
      in {
        _module.args = import inputs.nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };
        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [ 
              nodejs_20
              corepackEnable
              docker-compose
              just
              redpanda-client
            ];
          };
        };
      };
    };
}
