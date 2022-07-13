{ pkgs ? import <nixpkgs> {} }:

let
  NPM_CONFIG_PREFIX = "./node_modules";
  /* toString ./npm_config_prefix; */
in pkgs.mkShell {
  packages = with pkgs; [
    nodejs-slim
    yarn
    yarn2nix
  ];

  inherit NPM_CONFIG_PREFIX;

  shellHook = ''
    export PATH="${NPM_CONFIG_PREFIX}/.bin:$PATH"
  '';
}
