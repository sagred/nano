export function modifyManifestPlugin() {
    return {
      name: 'modify-manifest',
      writeBundle(options, bundle) {
        const manifestFile = bundle['manifest.json'];
        if (manifestFile && manifestFile.type === 'asset') {
          const manifest = JSON.parse(manifestFile.source);
          // Ensure side panel properties are present
          manifest.permissions = [...new Set([...manifest.permissions, 'sidePanel'])];
          manifest.side_panel = {
            default_path: 'sidepanel.html'
          };
          manifest.action = {
            ...manifest.action,
            default_panel: 'sidepanel.html'
          };
          manifestFile.source = JSON.stringify(manifest, null, 2);
        }
      }
    };
  }