{pkgs ? import <nixpkgs> {}}:
  pkgs.mkShell {
    packages = with pkgs; [
     hugo
	 go
    ];
  }