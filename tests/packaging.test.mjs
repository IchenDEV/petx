import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = new URL('../', import.meta.url);
const repositoryUrl = 'git+https://github.com/IchenDEV/petx.git';
const homepage = 'https://github.com/IchenDEV/petx#readme';
const bugsUrl = 'https://github.com/IchenDEV/petx/issues';

const publishedPackages = [
  { dir: 'packages/core', name: '@petx/core', hasCss: false },
  { dir: 'packages/react', name: '@petx/react', hasCss: true },
  { dir: 'packages/vue', name: '@petx/vue', hasCss: true },
  { dir: 'packages/svelte', name: '@petx/svelte', hasCss: true },
  { dir: 'packages/solid', name: '@petx/solid', hasCss: true },
  { dir: 'packages/webcomponent', name: '@petx/webcomponent', hasCss: false },
];

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, repoRoot), 'utf8'));
}

test('root package uses pnpm workspace commands for published packages only', async () => {
  const rootPackage = await readJson('package.json');

  assert.equal(rootPackage.private, true);
  assert.equal(rootPackage.version, '0.1.0');
  assert.equal(rootPackage.packageManager, 'pnpm@10.32.1');
  assert.equal(rootPackage.workspaces, undefined);
  assert.match(rootPackage.scripts['pack:check'], /pnpm -r .* pack --dry-run --json/);
  assert.match(rootPackage.scripts['pack:tarballs'], /pnpm -r .* pack --pack-destination npm-packages/);
  assert.match(rootPackage.scripts['publish:dry-run'], /pnpm -r .* publish --dry-run --access public/);
  assert.match(rootPackage.scripts['publish:packages'], /pnpm -r .* publish --access public/);

  for (const scriptName of ['pack:check', 'pack:tarballs', 'publish:dry-run', 'publish:packages']) {
    const script = rootPackage.scripts[scriptName];
    assert.doesNotMatch(script, /examples\//);
    for (const pkg of publishedPackages) {
      assert.match(script, new RegExp(`--filter ${pkg.name.replace('/', '\\/')}`));
    }
  }
});

test('pnpm workspace includes packages and examples', async () => {
  const workspace = await readFile(new URL('pnpm-workspace.yaml', repoRoot), 'utf8');

  assert.match(workspace, /^packages:$/m);
  assert.match(workspace, /  - packages\/\*/);
  assert.match(workspace, /  - examples\/\*/);
});

test('local packages use pnpm workspace protocol for internal dependencies', async () => {
  for (const pkg of publishedPackages.filter((pkg) => pkg.name !== '@petx/core')) {
    const packageJson = await readJson(`${pkg.dir}/package.json`);

    assert.equal(packageJson.dependencies['@petx/core'], 'workspace:*');
  }

  for (const example of ['react', 'vue', 'svelte', 'solid', 'webcomponent']) {
    const packageJson = await readJson(`examples/${example}/package.json`);
    const dependencyName = example === 'webcomponent' ? '@petx/webcomponent' : `@petx/${example}`;

    assert.equal(packageJson.dependencies[dependencyName], 'workspace:*');
  }
});

test('published package manifests have npm registry metadata and precise exports', async () => {
  for (const pkg of publishedPackages) {
    const packageJson = await readJson(`${pkg.dir}/package.json`);

    assert.equal(packageJson.name, pkg.name);
    assert.equal(packageJson.version, '0.1.0');
    assert.equal(packageJson.license, 'MIT');
    assert.ok(packageJson.description.length > 20);
    assert.equal(packageJson.homepage, homepage);
    assert.equal(packageJson.bugs.url, bugsUrl);
    assert.equal(packageJson.repository.type, 'git');
    assert.equal(packageJson.repository.url, repositoryUrl);
    assert.equal(packageJson.repository.directory, pkg.dir);
    assert.deepEqual(packageJson.publishConfig, { access: 'public' });
    assert.ok(packageJson.keywords.includes('codex-pet'));
    assert.deepEqual(packageJson.files, ['dist']);
    assert.equal(packageJson.exports['./package.json'], './package.json');
    assert.equal(packageJson.exports['.'].types, './dist/index.d.ts');
    assert.equal(packageJson.exports['.'].import, './dist/index.js');
    assert.equal(packageJson.exports['.'].default, './dist/index.js');

    if (pkg.hasCss) {
      assert.deepEqual(packageJson.sideEffects, ['**/*.css']);
      assert.equal(packageJson.exports['./styles.css'], './dist/styles.css');
    } else {
      assert.equal(packageJson.sideEffects, false);
    }
  }
});

test('release docs define the first public version as 0.1', async () => {
  const readme = await readFile(new URL('README.md', repoRoot), 'utf8');
  const changelog = await readFile(new URL('CHANGELOG.md', repoRoot), 'utf8');

  assert.match(readme, /first public release is `0\.1`/i);
  assert.match(readme, /SemVer form `0\.1\.0`/);
  assert.match(changelog, /^## 0\.1$/m);
});

test('published packages carry npm readmes and package-level ignore guards', async () => {
  for (const pkg of publishedPackages) {
    const readme = await readFile(new URL(`${pkg.dir}/README.md`, repoRoot), 'utf8');
    const npmIgnore = await readFile(new URL(`${pkg.dir}/.npmignore`, repoRoot), 'utf8');

    assert.match(readme, new RegExp(`# ${pkg.name.replace('/', '\\/')}`));
    assert.match(npmIgnore, /^src\/$/m);
    assert.match(npmIgnore, /^tsconfig\.json$/m);
    assert.match(npmIgnore, /^\*\.tgz$/m);
  }
});

test('pnpm pack dry-run includes only publishable package files', async () => {
  const workspaceArgs = publishedPackages.flatMap((pkg) => ['--filter', pkg.name]);
  const { stdout } = await execFileAsync('pnpm', ['-r', ...workspaceArgs, 'pack', '--dry-run', '--json'], {
    cwd: repoRoot,
    maxBuffer: 1024 * 1024 * 4,
  });
  const packed = JSON.parse(stdout);

  assert.equal(packed.length, publishedPackages.length);

  for (const packageTarball of packed) {
    const paths = packageTarball.files.map((file) => file.path);

    assert.ok(paths.includes('package.json'));
    assert.ok(paths.includes('README.md'));
    assert.ok(paths.includes('dist/index.js'));
    assert.ok(paths.includes('dist/index.d.ts'));
    assert.ok(paths.every((path) => !path.startsWith('src/')), `${packageTarball.name} includes src files`);
    assert.ok(!paths.includes('tsconfig.json'), `${packageTarball.name} includes tsconfig.json`);
    assert.ok(!paths.some((path) => path.endsWith('.tsbuildinfo')), `${packageTarball.name} includes tsbuildinfo`);
    assert.ok(!paths.some((path) => path.endsWith('.tgz')), `${packageTarball.name} includes tgz`);
  }
});
