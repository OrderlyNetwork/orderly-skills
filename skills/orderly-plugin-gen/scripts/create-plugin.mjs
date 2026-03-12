#!/usr/bin/env node

/**
 * Orderly SDK Plugin Generator
 *
 * Generates a complete plugin package skeleton within the monorepo.
 * Zero third-party dependencies — uses only Node.js built-ins.
 *
 * Usage:
 *   node create-plugin.mjs --name <name> --type <widget|page|layout> --path <parent-dir>
 *   node create-plugin.mjs ... --offline   # skip npm fetch, use "latest" for all orderly packages
 */

import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    name: { type: "string" },
    type: { type: "string", default: "widget" },
    path: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    offline: { type: "boolean", default: false },
  },
  strict: true,
});

if (!args.name) {
  console.error("Error: --name is required");
  process.exit(1);
}

if (!args.path) {
  console.error("Error: --path is required (absolute path to parent directory)");
  process.exit(1);
}

const VALID_TYPES = ["widget", "page", "layout"];
const pluginType = (args.type ?? "widget").toLowerCase();

if (!VALID_TYPES.includes(pluginType)) {
  console.error(`Error: --type must be one of: ${VALID_TYPES.join(", ")}`);
  process.exit(1);
}

const NAME_RE = /^[a-z][a-z0-9-]*$/;
const pluginName = args.name.toLowerCase().replace(/_/g, "-");

if (!NAME_RE.test(pluginName)) {
  console.error(
    "Error: --name must start with a letter and contain only lowercase letters, digits, and hyphens"
  );
  process.exit(1);
}

const dryRun = args["dry-run"] ?? false;
const parentDir = resolve(args.path);
const dirName = `${pluginName}`;
const pluginDir = join(parentDir, dirName);
const pkgScope = "@orderly.network";
const pkgName = `${pkgScope}/${pluginName}-plugin`;

// ---------------------------------------------------------------------------
// Generate unique plugin ID
// ---------------------------------------------------------------------------

function generatePluginId(name) {
  const seed = `${name}-${Date.now()}-${randomBytes(8).toString("hex")}`;
  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 8);
  return `orderly-plugin-${name}-${hash}`;
}

const pluginId = generatePluginId(pluginName);

// ---------------------------------------------------------------------------
// Resolve @orderly.network package versions from npm
// ---------------------------------------------------------------------------

const NPM_REGISTRY = "https://registry.npmjs.org";

const ORDERLY_PACKAGES = [
  "@orderly.network/plugin-core",
  "@orderly.network/hooks",
  "@orderly.network/i18n",
  "@orderly.network/types",
  "@orderly.network/ui",
];

async function fetchLatestVersion(packageName) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${NPM_REGISTRY}/${packageName}/latest`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.version ?? null;
  } catch {
    return null;
  }
}

async function resolveOrderlyVersions() {
  const results = await Promise.all(
    ORDERLY_PACKAGES.map(async (pkg) => {
      const v = await fetchLatestVersion(pkg);
      return [pkg, v ?? "latest"];
    })
  );
  return Object.fromEntries(results);
}

// ---------------------------------------------------------------------------
// Template: package.json
// ---------------------------------------------------------------------------

function makePackageJson(versions) {
  return JSON.stringify(
    {
      name: pkgName,
      version: "0.1.0",
      description: `Orderly SDK plugin — ${pluginName}`,
      license: "MIT",
      main: "dist/index.js",
      module: "dist/index.mjs",
      types: "dist/index.d.ts",
      scripts: {
        build: "tsup && pnpm run build:css",
        "build:css": "tailwindcss build -i src/tailwind.css -o dist/styles.css --minify",
        dev: "tsup --watch",
        prepublishOnly: "pnpm build",
      },
      files: ["dist", "package.json", "README.md"],
      peerDependencies: {
        react: ">=18",
        "react-dom": ">=18",
        ...versions,
      },
      dependencies: {},
      devDependencies: {
        "@types/react": "^18.2.38",
        "@types/react-dom": "^18.2.17",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        tailwindcss: "^3.4.4",
        "tailwindcss-animate": "^1.0.6",
        tsup: "^8.5.1",
        typescript: "^5.1.6",
      },
      publishConfig: {
        access: "public",
      },
    },
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// Template: tsconfig.json & tsconfig.build.json
// ---------------------------------------------------------------------------

function makeTsconfig() {
  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/tsconfig",
      extends: "./tsconfig.build.json",
    },
    null,
    2
  );
}

function makeTsconfigBuild() {
  return JSON.stringify(
    {
      compilerOptions: {
        composite: false,
        declaration: true,
        declarationMap: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        inlineSources: false,
        isolatedModules: true,
        module: "esnext",
        moduleResolution: "node",
        noUnusedLocals: false,
        noUnusedParameters: false,
        preserveWatchOutput: true,
        skipLibCheck: true,
        target: "ES2020",
        strict: true,
        outDir: "dist",
        rootDir: "src",
        jsx: "react-jsx",
      },
      include: ["./src/**/*.ts", "./src/**/*.tsx"],
      exclude: [
        "dist",
        "node_modules",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.stories.tsx",
      ],
    },
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// Template: tsup.config.ts
// ---------------------------------------------------------------------------

function makeTsupConfig() {
  return `import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  target: "es2020",
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: !options.watch,
  dts: true,
  tsconfig: "tsconfig.build.json",
  external: [
    "react",
    "react-dom",
    "@orderly.network/plugin-core",
    "@orderly.network/hooks",
    "@orderly.network/ui",
    "@orderly.network/trading",
  ],
  esbuildOptions(esOptions, context) {
    if (!options.watch) {
      esOptions.drop = ["console", "debugger"];
    }
  },
}));
`;
}

// ---------------------------------------------------------------------------
// Template: .gitignore, README.md, Tailwind, .gitlab-ci.yml
// ---------------------------------------------------------------------------

function makeGitignore() {
  return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

dist
dist-ssr
*.local

# dependencies
node_modules


dist/
lib/
esm/

.vscode
.idea
.DS_Store

.npmrc
`;
}

function makeReadme() {
  const regFn = `register${pascalCase(pluginName)}Plugin`;
  return `# ${pkgName}

Orderly SDK **${pluginType}** plugin — ${pluginName}.

## Peer dependencies

- \`react\` >= 18, \`react-dom\` >= 18
- \`@orderly.network/plugin-core\`, \`@orderly.network/hooks\`, \`@orderly.network/i18n\`, \`@orderly.network/types\`, \`@orderly.network/ui\`

## Usage

\`\`\`tsx
import { ${regFn} } from "${pkgName}";

<OrderlyProvider plugins={[${regFn}()]}>
  ...
</OrderlyProvider>
\`\`\`

## Build

\`\`\`bash
pnpm build
\`\`\`

Runs \`tsup\` (JS/TS) and \`build:css\` (Tailwind → \`dist/styles.css\`).

## i18n

Export \`${pascalCase(pluginName)}PluginLocaleProvider\` for plugin-level locales. Add or edit JSON under \`src/i18n/locales/\`.
`;
}

function makeTailwindConfig() {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  presets: [require("@orderly.network/ui/tailwind.config.js")],
};
`;
}

function makeTailwindCss() {
  return `/* @tailwind base; */
@tailwind components;
@tailwind utilities;
`;
}

function makeGitlabCi() {
  return `include:
  - project: "orderlynetwork/orderly-fe/js-sdks/common-ci"
    ref: main
    file: "/npm-release.yml"
`;
}

// ---------------------------------------------------------------------------
// Template: src/i18n
// ---------------------------------------------------------------------------

function makeI18nModule() {
  const localesName = `${pascalCase(pluginName)}PluginLocales`;
  const typeName = `T${pascalCase(pluginName)}PluginLocales`;
  return `export const ${localesName} = {
  "common.ok": "OK",
};

export type ${typeName} = typeof ${localesName};
`;
}

function makeI18nProvider() {
  const localesName = `${pascalCase(pluginName)}PluginLocales`;
  const typeName = `T${pascalCase(pluginName)}PluginLocales`;
  const providerName = `${pascalCase(pluginName)}PluginLocaleProvider`;
  return `import { FC, PropsWithChildren } from "react";
import {
  preloadDefaultResource,
  ExternalLocaleProvider,
  LocaleCode,
} from "@orderly.network/i18n";
import { ${localesName}, ${typeName} } from "./module";

preloadDefaultResource(${localesName});

const resources = (lang: LocaleCode) => {
  return import(\`./locales/\${lang}.json\`).then(
    (res) => res.default as ${typeName}
  );
};

export const ${providerName}: FC<PropsWithChildren> = (props) => {
  return (
    <ExternalLocaleProvider resources={resources}>
      {props.children}
    </ExternalLocaleProvider>
  );
};
`;
}

function makeI18nIndex() {
  const providerName = `${pascalCase(pluginName)}PluginLocaleProvider`;
  return `export { ${providerName} } from "./provider";
`;
}

function makeI18nLocaleEn() {
  return `{
  "common.ok": "OK"
}
`;
}

// ---------------------------------------------------------------------------
// Template: src/index.tsx  (varies by plugin type)
// ---------------------------------------------------------------------------

function camelCase(str) {
  return str
    .split("-")
    .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join("");
}

function pascalCase(str) {
  return str
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

function makeWidgetIndex() {
  const fnName = `register${pascalCase(pluginName)}Plugin`;
  const componentName = `${pascalCase(pluginName)}Widget`;
  const componentFile = `${camelCase(pluginName)}Widget`;

  return `import React from "react";
import { createInterceptor } from "@orderly.network/plugin-core";
import type { OrderlySDK } from "@orderly.network/plugin-core";
import { ${componentName} } from "./components/${componentFile}";

export interface ${pascalCase(pluginName)}PluginOptions {
  /** Optional CSS class for the wrapper */
  className?: string;
}

/**
 * Register the ${pluginName} plugin.
 * Intercepts a target component and injects custom UI.
 */
export function ${fnName}(options?: ${pascalCase(pluginName)}PluginOptions) {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: "${pluginId}",
      name: "${pascalCase(pluginName)}",
      version: "0.1.0",
      orderlyVersion: ">=2.9.0",

      interceptors: [
        // TODO: Change the target path to the component you want to intercept.
        // Use the Inspector tool to discover available paths.
        createInterceptor(
          "Trading.OrderEntry.SubmitButton" as any,
          (Original, props, _api) => (
            <div className={options?.className}>
              <${componentName} />
              <Original {...props} />
            </div>
          ),
        ),
      ],

      setup: (api) => {
        // Non-UI logic: event subscriptions, logging, etc.
      },
    });
  };
}

export { ${pascalCase(pluginName)}PluginLocaleProvider } from "./i18n";
export default ${fnName};
`;
}

function makePageIndex() {
  const fnName = `register${pascalCase(pluginName)}Plugin`;
  const componentName = `${pascalCase(pluginName)}Page`;
  const componentFile = `${camelCase(pluginName)}Page`;

  return `import React from "react";
import type { OrderlySDK } from "@orderly.network/plugin-core";
import { ${componentName} } from "./components/${componentFile}";

export interface ${pascalCase(pluginName)}PluginOptions {
  /** Optional configuration */
  title?: string;
}

/**
 * Page plugin: ${pluginName}
 *
 * Page plugins are standalone route components.
 * Mount this via your host router — no interceptor registration needed.
 * The register function is kept for consistency and optional setup logic.
 */
export function ${fnName}(options?: ${pascalCase(pluginName)}PluginOptions) {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: "${pluginId}",
      name: "${pascalCase(pluginName)}",
      version: "0.1.0",
      orderlyVersion: ">=2.9.0",

      setup: (api) => {
        // Non-UI logic: event subscriptions, logging, etc.
      },
    });
  };
}

/** Export the page component for host router integration */
export { ${componentName} } from "./components/${componentFile}";
export { ${pascalCase(pluginName)}PluginLocaleProvider } from "./i18n";
export default ${fnName};
`;
}

function makeLayoutIndex() {
  const fnName = `register${pascalCase(pluginName)}Plugin`;
  const componentName = `${pascalCase(pluginName)}Layout`;
  const componentFile = `${camelCase(pluginName)}Layout`;

  return `import React from "react";
import { createInterceptor } from "@orderly.network/plugin-core";
import type { OrderlySDK } from "@orderly.network/plugin-core";
import { ${componentName} } from "./components/${componentFile}";

export interface ${pascalCase(pluginName)}PluginOptions {
  /** Optional CSS class for the layout wrapper */
  className?: string;
}

/**
 * Layout plugin: ${pluginName}
 *
 * Intercepts the top-level trading layout container and rearranges
 * child blocks (Chart, Orderbook, OrderEntry, etc.).
 */
export function ${fnName}(options?: ${pascalCase(pluginName)}PluginOptions) {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: "${pluginId}",
      name: "${pascalCase(pluginName)}",
      version: "0.1.0",
      orderlyVersion: ">=2.9.0",

      interceptors: [
        // Intercept the top-level layout to rearrange child blocks
        createInterceptor(
          "Trading.TradingLayout" as any,
          (Original, props, _api) => (
            <${componentName} className={options?.className}>
              <Original {...props} />
            </${componentName}>
          ),
        ),
      ],

      setup: (api) => {
        // Non-UI logic: event subscriptions, logging, etc.
      },
    });
  };
}

export { ${pascalCase(pluginName)}PluginLocaleProvider } from "./i18n";
export default ${fnName};
`;
}

// ---------------------------------------------------------------------------
// Template: src/components/<Component>.tsx  (varies by plugin type)
// ---------------------------------------------------------------------------

function makeWidgetComponent() {
  const componentName = `${pascalCase(pluginName)}Widget`;
  return `import React from "react";
import { Box } from "@orderly.network/ui";

export interface ${componentName}Props {
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  return (
    <Box className={className}>
      {/* TODO: Implement your widget UI here */}
      <p>${pascalCase(pluginName)} Widget</p>
    </Box>
  );
};
`;
}

function makePageComponent() {
  const componentName = `${pascalCase(pluginName)}Page`;
  return `import React from "react";
import { Box } from "@orderly.network/ui";

export interface ${componentName}Props {
  className?: string;
}

/**
 * Standalone page component.
 * Mount this via the host application's router.
 * You can use @orderly.network/hooks directly here.
 */
export const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  return (
    <Box className={className}>
      {/* TODO: Implement your page UI here */}
      <h1>${pascalCase(pluginName)}</h1>
    </Box>
  );
};
`;
}

function makeLayoutComponent() {
  const componentName = `${pascalCase(pluginName)}Layout`;
  return `import React from "react";
import { Box } from "@orderly.network/ui";

export interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Custom layout wrapper.
 * Rearranges trading page blocks (Chart, Orderbook, OrderEntry, etc.).
 */
export const ${componentName}: React.FC<${componentName}Props> = ({ className, children }) => {
  return (
    <Box className={className}>
      {/* TODO: Rearrange child blocks as needed */}
      {children}
    </Box>
  );
};
`;
}

// ---------------------------------------------------------------------------
// File creation
// ---------------------------------------------------------------------------

const COMPONENT_FILE_MAP = {
  widget: `${camelCase(pluginName)}Widget`,
  page: `${camelCase(pluginName)}Page`,
  layout: `${camelCase(pluginName)}Layout`,
};

const INDEX_FN_MAP = {
  widget: makeWidgetIndex,
  page: makePageIndex,
  layout: makeLayoutIndex,
};

const COMPONENT_FN_MAP = {
  widget: makeWidgetComponent,
  page: makePageComponent,
  layout: makeLayoutComponent,
};

const componentFileName = COMPONENT_FILE_MAP[pluginType];

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

if (existsSync(pluginDir)) {
  console.error(`Error: directory already exists — ${pluginDir}`);
  process.exit(1);
}

const versions = args.offline
  ? Object.fromEntries(ORDERLY_PACKAGES.map((p) => [p, "latest"]))
  : await resolveOrderlyVersions();

const files = [
  { rel: "package.json", content: makePackageJson(versions) },
  { rel: "tsconfig.json", content: makeTsconfig() },
  { rel: "tsconfig.build.json", content: makeTsconfigBuild() },
  { rel: "tsup.config.ts", content: makeTsupConfig() },
  { rel: ".gitignore", content: makeGitignore() },
  { rel: "README.md", content: makeReadme() },
  { rel: ".gitlab-ci.yml", content: makeGitlabCi() },
  { rel: "tailwind.config.cjs", content: makeTailwindConfig() },
  { rel: "src/tailwind.css", content: makeTailwindCss() },
  { rel: "src/index.tsx", content: INDEX_FN_MAP[pluginType]() },
  {
    rel: `src/components/${componentFileName}.tsx`,
    content: COMPONENT_FN_MAP[pluginType](),
  },
  { rel: "src/components/.gitkeep", content: "" },
  { rel: "src/i18n/module.ts", content: makeI18nModule() },
  { rel: "src/i18n/provider.tsx", content: makeI18nProvider() },
  { rel: "src/i18n/index.ts", content: makeI18nIndex() },
  { rel: "src/i18n/locales/en.json", content: makeI18nLocaleEn() },
];

console.log(`\n  Plugin Name : ${pluginName}`);
console.log(`  Plugin Type : ${pluginType}`);
console.log(`  Plugin ID   : ${pluginId}`);
console.log(`  Package     : ${pkgName}`);
console.log(`  Directory   : ${pluginDir}\n`);

if (dryRun) {
  console.log("  [dry-run] Files that would be created:\n");
  for (const f of files) {
    console.log(`    ${dirName}/${f.rel}`);
  }
  console.log("\n  [dry-run] No files were written.\n");
  process.exit(0);
}

for (const f of files) {
  const fullPath = join(pluginDir, f.rel);
  const dir = join(fullPath, "..");
  mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, f.content, "utf-8");
  console.log(`  created: ${dirName}/${f.rel}`);
}

console.log(`
  Done! Next steps:

  1. cd ${pluginDir}
  2. Run \`pnpm install\` from the monorepo root
  3. Edit src/index.tsx — add your interceptors / page logic
  4. Build with \`pnpm build\`
  5. Register in host app:

     import register${pascalCase(pluginName)}Plugin from "${pkgName}";

     <OrderlyProvider plugins={[register${pascalCase(pluginName)}Plugin()]}>
       ...
     </OrderlyProvider>
`);
