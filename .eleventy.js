// const { inspect } = require("node:util");

const bytes = require("bytes");
const pacote = require("pacote");

const { EleventyRenderPlugin } = require("@11ty/eleventy");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  eleventyConfig.addFilter("bytes", function (b) {
    const opts = { decimalPlaces: 1, fixedDecimals: true, unitSeparator: " " };
    return bytes(b, opts);
  });

  eleventyConfig.addShortcode("pacote_manifest", async function (name) {
    const manifest = await pacote.manifest(name);
    // Shim the EleventyRenderPlugin's `.renderTemplate()` method (LiquidJS-in-JavaScript y'all!)
    const html = await eleventyConfig.javascriptFunctions.renderTemplate(
      `
      <tr>
        <td>{{ manifest.version }}</td>
        <td><kbd>npm i {{ name }}</kbd></td>
        <td>{{ manifest.dist.fileCount }}</td>
        <td>{{ manifest.dist.unpackedSize | bytes }}</td>
        <td>Node {{ manifest.engines.node | escape }}</td>
      </tr>
      `,
      "liquid",
      { manifest, name }
    );
    return html.trim();
  });

  eleventyConfig.addNunjucksAsyncShortcode(
    "pacote_manifest2",
    async function (name) {
      const manifest = await pacote.manifest(name);
      // Shim the EleventyRenderPlugin's `.renderFile()` method (LiquidJS-in-JavaScript y'all!)
      const html = await eleventyConfig.javascriptFunctions.renderFile(
        "./src/_includes/manifest.liquid",
        { manifest, name }
      );
      return html.trim();
    }
  );

  return {
    dir: {
      input: "src",
      output: "www",
    },
  };
};
