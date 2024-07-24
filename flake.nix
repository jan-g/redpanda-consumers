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
      }: {
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
              docker-compose
              just
              redpanda-client
            ];
          };
        };
      };
    };
}
