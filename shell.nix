{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.python311
    pkgs.libxml2Python
    pkgs.nodejs
    pkgs.git
    # Add other packages as needed
  ];
}

