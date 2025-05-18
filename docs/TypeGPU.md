---
url: "https://docs.swmansion.com/TypeGPU/"
title: "TypeGPU – Type-safe WebGPU toolkit"
---

![TypeGPU Logo](https://docs.swmansion.com/TypeGPU/_astro/typegpu-logo-light.BnP9ser8_ZaKv6W.svg)

# TypeScript library that enhances the WebGPU    API, allowing resource management in    a type-safe, declarative way.

[Get started](https://docs.swmansion.com/TypeGPU/getting-started) [Explore live examples](https://docs.swmansion.com/TypeGPU/examples)

## Get to know TypeGPU

Discover how it can change the way you work with GPU rendering and
computing.

![task-check](https://docs.swmansion.com/TypeGPU/assets/task-check.svg)

### Easily encode and decode

Leveraging [typed-binary](https://github.com/iwoplaza/typed-binary) ensures you don't have to think about bytes when writing your GPU programs
ever again.

![grid-mixed](https://docs.swmansion.com/TypeGPU/assets/grid-mixed.svg)

### Compose data types

Complex data types like structs and arrays can be easily described,
and TypeScript automatically validates outgoing and incoming data.

![atom](https://docs.swmansion.com/TypeGPU/assets/atom.svg)

### Run it on React Native

Works on React Native thanks to the recently announced
[react-native-wgpu](https://github.com/wcandillon/react-native-webgpu)
library.

### More coming soon...

## Roadmap

The road to end-to-end type safety on the GPU involves implementing
several interoperating primitives. Below is our roadmap of features
that aim to fulfill that goal.

1. ### Data structures & buffers Released in 0.1v0.1




The WebGPU Shading Language (WGSL) gives developers a rich sense of
the structure of the data that it operates on. This is lost when accessed
through JavaScript, as the APIs accept raw byte buffers. TypeGPU regains
that information on the JavaScript side and handles proper byte alignment
and padding automatically.


2. ### Bind groups Released in 0.2v0.2




Connecting resources to shaders via numeric indices can lead to problems
that are hard to catch at build-time/CI. By using named keys and typed
data structures we can ensure that the provided resources are what
the shader expects.


3. ### Linker Released in 0.3v0.3




No more duplication between JS and GPU object definitions. A dedicated
linker combines WGSL code with TypeGPU objects it references, producing
shader code ready to be used in pipelines.


4. ### Functions




By wrapping each function with a "typed shell", they can be moved across
different files/modules. Any resources (variables, buffers, etc.) in
the external scope can be accessed inside the function.


5. ### Pipelines




To ensure that shader stages match each other, and pipeline constants
are filled with proper values, TypeGPU plans to provide typed pipelines.


6. ### Imperative code




By giving developers the ability to write imperative shader code in
TypeScript, we can leverage the excellent TypeScript LSP to complete
the type safety puzzle, bridging the gap between our API and type-safe
shader code.



Take active part in the development by joining our discussions.

[![GitHub Logo](https://docs.swmansion.com/TypeGPU/_astro/github-icon.CZ4nSWnr_Z1cKeQz.svg)\\
GitHub Discussions](https://github.com/software-mansion/TypeGPU/discussions) [![Discord Logo](https://docs.swmansion.com/TypeGPU/_astro/discord-icon.DOnL-Ued_Z1cKeQz.svg) Discord Server](https://discord.gg/8jpfgDqPcM)

# Got hooked?

Try TypeGPU and reshape your GPU rendering and computing.

[Get started](https://docs.swmansion.com/TypeGPU/getting-started)![An illustration showing the TypeGPU plums in a bowl.](https://docs.swmansion.com/TypeGPU/_astro/illustration.CBv7DC8r_1B3F11.svg)---
url: "https://docs.swmansion.com/TypeGPU/blog/"
title: "Blog | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/#_top)

# Blog

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/rss.xml"
title: "TypeGPU | Blog"
---

TypeGPU \| Bloghttps://docs.swmansion.com/enHow to enable WebGPU on your devicehttps://docs.swmansion.com/TypeGPU/blog/troubleshooting/https://docs.swmansion.com/TypeGPU/blog/troubleshooting/Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.

Fri, 04 Oct 2024 00:00:00 GMT<p>Since WebGPU is still considered experimental, despite being supported by many
browsers, it is often hidden behind flags. This post will help you find out if
your browser secretly supports WebGPU and, if it does, how you can enable it. In
general, you can check if your browser supports WebGPU by visiting
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU\_API#browser\_compatibility">the WebGPU API doccumentation</a>
and looking for your browser in the list. If it is listed under <code dir="auto">full support</code>
it should generally work out of the box (on the listed operating systems). There
are some cases where it is more complicated and requires some manual
configuration. This post will guide you through the process of enabling WebGPU
on your devices.</p>
<h2 id="safari-on-ios">Safari on iOS</h2>
<p>Despite what the
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU\_API#browser\_compatibility">docs</a>
tell us, there is a way to enable WebGPU in Safari on iOS.</p>
<p>To enable WebGPU go to:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Apps > Safari > Advanced > Feature Flags</span></div></div></code></pre><div></div></figure></div>
<p>or for iOS versions lower than 18:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Safari > Advanced > Feature Flags</span></div></div></code></pre><div></div></figure></div>
<p>Then enable WebGPU and restart Safari.</p>
<p>That’s it! After enabling the WebGPU flag you can go to
<a href="https://docs.swmansion.com/TypeGPU/examples/">our examples page</a> and you should
be able to tinker with them on your phone.</p>
<h2 id="safari-on-macos">Safari on macOS</h2>
<p>Go to:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Advanced</span></div></div></code></pre><div></div></figure></div>
<p>And check the <code dir="auto">Show features for web developers</code> checkbox. After that, you can
go to:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Feature Flags</span></div></div></code></pre><div></div></figure></div>
<p>And search for the WebGPU checkbox. Enable it and you should be good to go!</p>
<h2 id="deno">Deno</h2>
<p>If you are running Deno 1.39 or newer you can either:</p>
<ul>
<li>Run your script with the <code dir="auto">--unstable-webgpu</code> flag</li>
<li>Add the following line to your <code dir="auto">deno.json</code> file:</li>
</ul>
<div><figure><figcaption></figcaption><pre data-language="json"><code><div><div><span style="--0:#D9F5DD;--1:#111111">"</span><span style="--0:#ECC48D;--1:#984E4D">unstable</span><span style="--0:#D9F5DD;--1:#111111">"</span><span style="--0:#D6DEEB;--1:#403F53">: \[</span></div></div><div><div><span> </span><span style="--0:#D9F5DD;--1:#111111">"</span><span style="--0:#ECC48D;--1:#984E4D">webgpu</span><span style="--0:#D9F5DD;--1:#111111">"</span></div></div><div><div><span style="--0:#D6DEEB;--1:#403F53">\]</span></div></div></code></pre><div></div></figure></div>
<h2 id="chrome-for-android-and-desktop">Chrome for Android and desktop</h2>
<p>WebGPU for Google Chrome should work by default on Android and desktop devices,
just make sure you run the newest available version of the app. If however it
does not work, you might need to try enabling some experimental flags listed in
the official
<a href="https://developer.chrome.com/docs/web-platform/webgpu/troubleshooting-tips">Chrome developer documentation</a>.</p>SafariiPhoneChromeTroubleshootingmacOSWebGPU supportDeno

<rssxmlns:content="http://purl.org/rss/1.0/modules/content/"version="2.0">

<channel>

<title>TypeGPU \| Blog</title>

<description/>

<link>https://docs.swmansion.com/</link>

<language>en</language>

<item>

<title>How to enable WebGPU on your device</title>

<link>https://docs.swmansion.com/TypeGPU/blog/troubleshooting/</link>

<guidisPermaLink="true">https://docs.swmansion.com/TypeGPU/blog/troubleshooting/</guid>

<description>Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.

</description>

<pubDate>Fri, 04 Oct 2024 00:00:00 GMT</pubDate>

<content:encoded><p>Since WebGPU is still considered experimental, despite being supported by many
browsers, it is often hidden behind flags. This post will help you find out if
your browser secretly supports WebGPU and, if it does, how you can enable it. In
general, you can check if your browser supports WebGPU by visiting
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU\_API#browser\_compatibility">the WebGPU API doccumentation</a>
and looking for your browser in the list. If it is listed under <code dir="auto">full support</code>
it should generally work out of the box (on the listed operating systems). There
are some cases where it is more complicated and requires some manual
configuration. This post will guide you through the process of enabling WebGPU
on your devices.</p>
<h2 id="safari-on-ios">Safari on iOS</h2>
<p>Despite what the
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU\_API#browser\_compatibility">docs</a>
tell us, there is a way to enable WebGPU in Safari on iOS.</p>
<p>To enable WebGPU go to:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Apps > Safari > Advanced > Feature Flags</span></div></div></code></pre><div></div></figure></div>
<p>or for iOS versions lower than 18:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Safari > Advanced > Feature Flags</span></div></div></code></pre><div></div></figure></div>
<p>Then enable WebGPU and restart Safari.</p>
<p>That’s it! After enabling the WebGPU flag you can go to
<a href="https://docs.swmansion.com/TypeGPU/examples/">our examples page</a> and you should
be able to tinker with them on your phone.</p>
<h2 id="safari-on-macos">Safari on macOS</h2>
<p>Go to:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Advanced</span></div></div></code></pre><div></div></figure></div>
<p>And check the <code dir="auto">Show features for web developers</code> checkbox. After that, you can
go to:</p>
<div><figure><figcaption></figcaption><pre data-language="plaintext"><code><div><div><span style="--0:#d6deeb;--1:#403f53">Settings > Feature Flags</span></div></div></code></pre><div></div></figure></div>
<p>And search for the WebGPU checkbox. Enable it and you should be good to go!</p>
<h2 id="deno">Deno</h2>
<p>If you are running Deno 1.39 or newer you can either:</p>
<ul>
<li>Run your script with the <code dir="auto">--unstable-webgpu</code> flag</li>
<li>Add the following line to your <code dir="auto">deno.json</code> file:</li>
</ul>
<div><figure><figcaption></figcaption><pre data-language="json"><code><div><div><span style="--0:#D9F5DD;--1:#111111">"</span><span style="--0:#ECC48D;--1:#984E4D">unstable</span><span style="--0:#D9F5DD;--1:#111111">"</span><span style="--0:#D6DEEB;--1:#403F53">: \[</span></div></div><div><div><span> </span><span style="--0:#D9F5DD;--1:#111111">"</span><span style="--0:#ECC48D;--1:#984E4D">webgpu</span><span style="--0:#D9F5DD;--1:#111111">"</span></div></div><div><div><span style="--0:#D6DEEB;--1:#403F53">\]</span></div></div></code></pre><div></div></figure></div>
<h2 id="chrome-for-android-and-desktop">Chrome for Android and desktop</h2>
<p>WebGPU for Google Chrome should work by default on Android and desktop devices,
just make sure you run the newest available version of the app. If however it
does not work, you might need to try enabling some experimental flags listed in
the official
<a href="https://developer.chrome.com/docs/web-platform/webgpu/troubleshooting-tips">Chrome developer documentation</a>.</p></content:encoded>

<category>Safari</category>

<category>iPhone</category>

<category>Chrome</category>

<category>Troubleshooting</category>

<category>macOS</category>

<category>WebGPU support</category>

<category>Deno</category>

...

</item>

...

</channel>

...

</rss>---
url: "https://docs.swmansion.com/TypeGPU/blog/tags/chrome/"
title: "Chrome | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/tags/chrome/#_top)

# Chrome

1 post with the tag “Chrome”

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/tags/deno/"
title: "Deno | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/tags/deno/#_top)

# Deno

1 post with the tag “Deno”

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/tags/iphone/"
title: "iPhone | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/tags/iphone/#_top)

# iPhone

1 post with the tag “iPhone”

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/tags/macos/"
title: "macOS | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/tags/macos/#_top)

# macOS

1 post with the tag “macOS”

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/tags/safari/"
title: "Safari | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/tags/safari/#_top)

# Safari

1 post with the tag “Safari”

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/tags/troubleshooting/"
title: "Troubleshooting | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/tags/troubleshooting/#_top)

# Troubleshooting

1 post with the tag “Troubleshooting”

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/tags/webgpu-support/"
title: "WebGPU support | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/tags/webgpu-support/#_top)

# WebGPU support

1 post with the tag “WebGPU support”

Since WebGPU is still considered experimental, despite being supported by many browsers, it is often hidden behind flags. This post will help you find out if your browser supports WebGPU and help you enable it if needed.---
url: "https://docs.swmansion.com/TypeGPU/blog/troubleshooting/"
title: "How to enable WebGPU on your device | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/blog/troubleshooting/#_top)

# How to enable WebGPU on your device

![A laptop with the WebGPU logo on its screen, surrounded by logos of various platforms that can run WebGPU after applying certain tweaks.](https://docs.swmansion.com/TypeGPU/_astro/troubleshooting_thumbnail.CaK20INX_ZHP7jS.webp)

Oct 4, 2024  \- Last update: Nov 15, 2024

![Konrad](https://avatars.githubusercontent.com/u/66403540?s=200)

Konrad

TypeGPU developer

Since WebGPU is still considered experimental, despite being supported by many
browsers, it is often hidden behind flags. This post will help you find out if
your browser secretly supports WebGPU and, if it does, how you can enable it. In
general, you can check if your browser supports WebGPU by visiting
[the WebGPU API doccumentation](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility)
and looking for your browser in the list. If it is listed under `full support`
it should generally work out of the box (on the listed operating systems). There
are some cases where it is more complicated and requires some manual
configuration. This post will guide you through the process of enabling WebGPU
on your devices.

## Safari on iOS

Despite what the
[docs](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility)
tell us, there is a way to enable WebGPU in Safari on iOS.

To enable WebGPU go to:

```

Settings > Apps > Safari > Advanced > Feature Flags
```

or for iOS versions lower than 18:

```

Settings > Safari > Advanced > Feature Flags
```

Then enable WebGPU and restart Safari.

That’s it! After enabling the WebGPU flag you can go to
[our examples page](https://docs.swmansion.com/TypeGPU/examples/) and you should
be able to tinker with them on your phone.

## Safari on macOS

Go to:

```

Settings > Advanced
```

And check the `Show features for web developers` checkbox. After that, you can
go to:

```

Settings > Feature Flags
```

And search for the WebGPU checkbox. Enable it and you should be good to go!

## Deno

If you are running Deno 1.39 or newer you can either:

- Run your script with the `--unstable-webgpu` flag
- Add the following line to your `deno.json` file:

```

"unstable": [\
\
  "webgpu"\
\
]
```

## Chrome for Android and desktop

WebGPU for Google Chrome should work by default on Android and desktop devices,
just make sure you run the newest available version of the app. If however it
does not work, you might need to try enabling some experimental flags listed in
the official
[Chrome developer documentation](https://developer.chrome.com/docs/web-platform/webgpu/troubleshooting-tips).

**Tags:**

- [Safari](https://docs.swmansion.com/TypeGPU/blog/tags/safari)
- [iPhone](https://docs.swmansion.com/TypeGPU/blog/tags/iphone)
- [Chrome](https://docs.swmansion.com/TypeGPU/blog/tags/chrome)
- [Troubleshooting](https://docs.swmansion.com/TypeGPU/blog/tags/troubleshooting)
- [macOS](https://docs.swmansion.com/TypeGPU/blog/tags/macos)
- [WebGPU support](https://docs.swmansion.com/TypeGPU/blog/tags/webgpu-support)
- [Deno](https://docs.swmansion.com/TypeGPU/blog/tags/deno)---
url: "https://docs.swmansion.com/TypeGPU/fundamentals/bind-groups/"
title: "Bind Groups | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/fundamentals/bind-groups/#_top)

# Bind Groups

A bind group is a collection of resources that are bound to a shader. These resources can be buffers, textures, or samplers.
It’s a way to define what resources are available to a shader and how they are accessed.

```

import tgpu from 'typegpu';

import * as d from 'typegpu/data';

// Defining the layout of resources we want the shader to

// have access to.

const fooLayout = tgpu.bindGroupLayout({

  foo: { uniform: d.vec3f },

  bar: { texture: 'float' },

});

const fooBuffer = ...;

const barTexture = ...;

// Create a bind group that can fulfill the required layout.

const fooBindGroup = root.createBindGroup(fooLayout, {

  foo: fooBuffer,

  bar: barTexture,

});
```

In this example, we create a bind group that contains a buffer and a texture. Binding indices are determined based on the order of properties
in the layout.

Now, during command encoding, we can assign this bind group to a shader.

```

// Assuming group index is 0...

pass.setBindGroup(0, root.unwrap(fooBindGroup));
```

## Available resource types

Each property in the layout object represents a resource as seen by a shader. We recommend keeping the names of
these properties the same as the corresponding `@group(...) @binding(...) ...;` statements in WGSL.

```

const fooLayout = tgpu.bindGroupLayout({

  key0: { ... },

  key1: { ... },

  // ...

});
```

### Uniforms

To interpret a buffer as a uniform, create a property with the value matching:

```

{

  uniform: d.AnyData;

}
```

#### Simple example

```

const fooLayout = tgpu.bindGroupLayout({

  luckyNumber: { uniform: d.f32 },

  // ...

});
```

Matching WGSL statement:

```

@group(...) @binding(0) var<uniform> luckyNumber: f32;

// ...
```

### Storage

To get readonly/mutable access to a buffer, create a property with the value matching:

```

{

  storage: d.AnyData | ((n: number) => d.AnyData);

  /** @default 'readonly' */

  access?: 'readonly' | 'mutable';

}
```

#### Simple example

```

const fooLayout = tgpu.bindGroupLayout({

  counter: { storage: d.f32, access: 'mutable' },

  // ...

});
```

Matching WGSL statement:

```

@group(...) @binding(0) var<storage, read_write> counter: f32;

// ...
```

#### Runtime-sized example

Apart from being able to specify any data type, we can signal that the shader is generalized to work on
arbitrarily sized data by passing a function.

```

const Filter = (n: number) =>

  d.struct({

    clamp: d.f32,

    values: d.arrayOf(d.f32, n),

  });

const fooLayout = tgpu.bindGroupLayout({

  factors: { storage: (n: number) => d.arrayOf(d.f32, n) },

  filter: { storage: Filter },

  // ...

});
```

Matching WGSL code:

```

struct Filter {

  clamp: f32,

  values: array<f32>;

}

@group(...) @binding(0) var<storage, read> factors: array<f32>;

@group(...) @binding(1) var<storage, read> filter: Filter;

// ...
```

### Samplers

Samplers can be made accessible to shaders with a property that matches the following:

```

{

  sampler: 'filtering' | 'non-filtering' | 'comparison';

}
```

### Textures

To be able to sample a texture in a shader, create a property with the value matching:

```

{

  texture: 'float' | 'unfilterable-float' | 'depth' | 'sint' | 'uint';

  /** @default '2d' */

  viewDimension?: '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';

  /** @default false */

  multisampled?: boolean;

}
```

### Storage Textures

To be able to operate on textures more directly in a shader, create a property with the value matching:

```

{

  storageTexture: StorageTextureTexelFormat;

  /** @default 'writeonly' */

  access?: 'readonly' | 'writeonly' | 'mutable';

  /** @default '2d' */

  viewDimension?: '1d' | '2d' | '2d-array' | '3d';

}
```

You can see the list of supported storage texture formats [here](https://www.w3.org/TR/WGSL/#storage-texel-formats).

## Bind Groups

Before execution of a pipeline, any bind group that matches a given layout can be put in its place and used by the shader.
To create a bind group, you can call the `createBindGroup` method on the [root object](https://docs.swmansion.com/TypeGPU/fundamentals/roots) and associate each named key with
a proper resource.

```

const fooLayout = tgpu.bindGroupLayout({

  key0: { ... },

  key1: { ... },

  // ...

});

const fooBindGroup0 = root.createBindGroup(fooLayout, {

  key1: ...,

  key0: ...,

  // ...

});

const fooBindGroup1 = root.createBindGroup(fooLayout, {

  key0: ...,

  key1: ...,

  // ...

});

// ...
```

If you accidentally pass the wrong type of resource, the TypeScript compiler will catch the error at compile time.

- **Uniform** bindings with schema `TData` accept:

  - `TgpuBuffer<TData> & UniformFlag` \- buffers of type `TData` with `'uniform'` usage,
  - `GPUBuffer` \- raw WebGPU buffers.
- **Storage** bindings with schema `TData` accept:

  - `TgpuBuffer<TData> & StorageFlag` \- buffers of type `TData` with `'storage'` usage,
  - `GPUBuffer` \- raw WebGPU buffers.
- **Texture** bindings:

  - `GPUTextureView` \- views of raw WebGPU textures.
- **Storage Texture** bindings:

  - `GPUTextureView` \- views of raw WebGPU textures.
- **Sampler** bindings:

  - `sampler === 'comparison'`
    - `GPUSampler` \- raw WebGPU samplers created _with_ a `compare` function.
  - `sampler === 'filtering'` or `sampler === 'non-filtering'`
    - `GPUSampler` \- raw WebGPU samplers created _without_ a `compare` function.---
url: "https://docs.swmansion.com/TypeGPU/fundamentals/buffers/"
title: "Buffers | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/fundamentals/buffers/#_top)

# Buffers

Memory on the GPU can be allocated and managed through buffers. That way, WGSL shaders can be provided with an additional context, or retrieve the
results of parallel computation back to JS. When creating a buffer, a schema for the contained values has to be provided, which allows for:

- Calculating the required size of the buffer,
- Automatic conversion to-and-from a binary representation,
- Type-safe APIs for writing and reading.

As an example, let’s create a buffer for storing particles.

```

import tgpu from 'typegpu';

import * as d from 'typegpu/data';

// Defining a struct type

const Particle = d.struct({

  position: d.vec3f,

  velocity: d.vec3f,

  health: d.f32,

});

// Utility for creating a random particle

function createParticle(): d.Infer<typeof Particle> {

  return {

    position: d.vec3f(Math.random(), 2, Math.random()),

    velocity: d.vec3f(0, 9.8, 0),

    health: 100,

  };

}

const root = await tgpu.init();

// Creating and initializing a buffer.

const buffer = root

  .createBuffer(

    d.arrayOf(Particle, 100), // <- holds 100 particles

    Array.from({ length: 100 }).map(createParticle), // <- initial value

  )

  .$usage('storage'); // <- can be used as a "storage buffer"

// -

// --

// --- Shader omitted for brevity...

// --

// -

// Reading back from the buffer

const value = await buffer.read();

const value: {

    position: d.v3f;

    velocity: d.v3f;

    health: number;

}[]

```

This buffer can then be used and/or updated by a WGSL shader.

## Creating a buffer

To create a buffer, you will need to define its schema by composing data types imported from `typegpu/data`. Every WGSL data-type can be represented as JS schemas, including
structs and arrays. They will be explored in more detail in [a following chapter](https://docs.swmansion.com/TypeGPU/fundamentals/data-schemas).

```

const countBuffer = root.createBuffer(d.u32);

const countBuffer: TgpuBuffer<d.U32>

const listBuffer = root.createBuffer(d.arrayOf(d.f32, 10));

const listBuffer: TgpuBuffer<d.WgslArray<d.F32>>

const uniformsBuffer = root.createBuffer(d.struct({ a: d.f32, b: d.f32 }));

const uniformsBuffer: TgpuBuffer<d.WgslStruct<{

    a: d.F32;

    b: d.F32;

}>>

```

### Usage flags

To be able to use these buffers in WGSL shaders, we have to declare their usage upfront with `.$usage(...)`.

```

const buffer = root.createBuffer(d.u32)

  .$usage('uniform')

  .$usage(' ')

uniform
storage
vertex

```

You can also add all flags in a single `$usage()`.

```

const buffer = root.createBuffer(d.u32)

  .$usage('uniform', 'storage', ' ');

uniform
storage
vertex

```

### Additional flags

It is also possible to add any of the `GPUBufferUsage` flags to a typed buffer object, using the `.$addFlags` method.
Though it shouldn’t be necessary in most scenarios as majority of the flags are handled automatically by the library
or indirectly through the `.$usage` method.

```

buffer.$addFlags(GPUBufferUsage.QUERY_RESOLVE);
```

Flags can only be added this way if the typed buffer was not created with an existing GPU buffer.
If it was, then all flags need to be provided to the existing buffer when constructing it.

### Initial value

You can also pass an initial value to the `root.createBuffer` function.
When the buffer is created, it will be mapped at creation, and the initial value will be written to the buffer.

```

// Will be initialized to `100`

const buffer1 = root.createBuffer(d.u32, 100);

// Will be initialized to an array of two vec3fs with the specified values.

const buffer2 = root.createBuffer(d.arrayOf(d.vec3f, 2), [\
\
  d.vec3f(0, 1, 2),\
\
  d.vec3f(3, 4, 5),\
\
]);
```

### Using an existing buffer

You can also create a buffer using an existing WebGPU buffer. This is useful when you have existing logic but want to introduce type-safe data operations.

```

// A raw WebGPU buffer

const existingBuffer = root.device.createBuffer({

  size: 4,

  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,

});

const buffer = root.createBuffer(d.u32, existingBuffer);

buffer.write(12); // Writing to `existingBuffer` through a type-safe API
```

## Writing to a buffer

To write data to a buffer, you can use the `.write(value)` method. The typed schema enables auto-complete as well as static validation of this
method’s arguments.

```

const Particle = d.struct({

  position: d.vec2f,

  health: d.u32,

});

const particleBuffer = root.createBuffer(Particle);

particleBuffer.write({

  position: d.vec2f(1.0, 2.0),

  heal

health

});
```

### Partial writes

When you want to update only a subset of a buffer’s fields, you can use the `.writePartial(data)` method. This method updates only the fields provided in the `data` object and leaves the rest unchanged.

The format of the `data` value depends on your schema type:

- **For `d.struct` schemas:**
Provide an object with keys corresponding to the subset of the schema’s fields you wish to update.

- **For `d.array` schemas:**
Provide an array of objects. Each object should specify:
  - `idx`: the index of the element to update.
  - `value`: the new value for that element.

```

const Planet = d.struct({

  radius: d.f32,

  mass: d.f32,

  position: d.vec3f,

  colors: d.arrayOf(d.vec3f, 5),

});

const planetBuffer = root.createBuffer(Planet);

planetBuffer.writePartial({

  mass: 123.1,

  colors: [\
\
    { idx: 2, value: d.vec3f(1, 0, 0) },\
\
    { idx: 4, value: d.vec3f(0, 0, 1) },\
\
  ],

});
```

### Copying

There’s also an option to copy value from another typed buffer using the `.copyFrom(buffer)` method,
as long as both buffers have a matching data schema.

```

const backupParticleBuffer = root.createBuffer(Particle);

backupParticleBuffer.copyFrom(particleBuffer);
```

## Reading from a buffer

To read data from a buffer, you can use the `.read()` method.
It returns a promise that resolves to the data read from the buffer.

```

const buffer = root.createBuffer(d.arrayOf(d.u32, 10));

const data = await buffer.read();

const data: number[]

```---
url: "https://docs.swmansion.com/TypeGPU/fundamentals/data-schemas/"
title: "Data Schemas | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/fundamentals/data-schemas/#_top)

# Data Schemas

Writing a GPU program usually involves sharing data between the host (CPU) and the device (GPU), in this case between JavaScript and WGSL.
Any misalignments or misinterpretations of data can lead to bugs that are hard to debug (No `console.log` on the GPU, I am afraid).
While data is strongly typed in WGSL shaders, we give up that type safety completely when writing and reading data in JavaScript/TypeScript.
This is precisely what TypeGPU data types help with.

## Examples

Let’s look at some examples of defining custom data types using the `typegpu/data` module. If you’re familiar with [Zod](https://zod.dev/), then this style of schema definitions may already seem familiar.

```

import * as d from 'typegpu/data';

const Circle = d.struct({

  centerPos: d.vec3i,

  radius: d.f32,

});

type Circle = d.Infer<typeof Circle>;

type Circle = {

    centerPos: d.v3i;

    radius: number;

}

const redCircle: Circle = {

  centerPos: d.vec3i(2, 4, 0),

  radius: 0.2,

};
```

By defining the `Circle` struct in TypeScript via TypeGPU, in a similar way to how we would in WGSL, we gain access to its TypeScript type
definition, which we can use to validate our data values. When reading from or writing data to the GPU, the type of the JavaScript value
is inferred automatically, and it’s enforced by TypeScript. Thanks to that, whenever we mistakenly set or assume a wrong value for an object,
we get a type error, avoiding unnecessary debugging afterwards. That’s a big improvement to the development process.

```

const redCircle1: Circle = {

  centerPos: d.vec2i(2, 4),
Error ts(2740)  ― Type 'v2i' is missing the following properties from type 'v3i': z, 2, xz, yz, and 87 more.

  radius: 0.2,

};

const redCircle2: Circle = {

  centerPos: d.vec3i(2, 4, 0),

  radius: "0.2",
Error ts(2322)  ― Type 'string' is not assignable to type 'number'.

};

const redCircle3: Circle = {
Error ts(2741)  ― Property 'radius' is missing in type '{ centerPos: d.v3i; }' but required in type '{ centerPos: v3i; radius: number; }'.

  centerPos: d.vec3i(2, 4, 0),

};

const diam = redCircle1.rad * 2;
Error ts(2339)  ― Property 'rad' does not exist on type '{ centerPos: v3i; radius: number; }'.
```

Defined data structures automatically measure and hold information about their memory layout parameters, which is useful for writing to and reading data from the GPU.

```

sizeOf(Circle) // 16

alignmentOf(Circle) // 16
```

TypeGPU data types are essential for the library’s automated data marshalling capabilities.

## Scalars, Vectors & Matrices

There are a few ways to categorize numeric data-types in TypeGPU.

- Characteristic (floating-point `f`, signed int `i`, unsigned int `u`).
- Size in bits (8, 16, 32).
- Number of components (1, 2, 3, 4, …).

`d.f32`, `d.i32` and `d.u32` all represent single-component 32-bit numeric values. When reading/writing values
in JS, they are all seen as just `number`.

Vectors ( `d.v2f`, `d.v3f`, …) are interpreted in JS as special objects, which can be created by “calling” the
corresponding schema with numeric components, e.g.:

```

const v0 = d.vec3f(1.1, 2.5, 3.3);

const v0: d.v3f

const v1 = d.vec4u(3, 4, 5, 2);

const v1: d.v4u

// ...
```

Matrices work in a similar way.

```

const mat0 = d.mat3x3f(

const mat0: d.m3x3f

  1.1, 2.5, 3.3,

  1.2, 2.6, 3.4,

  1.3, 2.7, 3.5,

);

const mat1 = d.mat2x2f(3, 4, 5, 2);

const mat1: d.m2x2f

// ...
```

For a comprehensive list of all available schemas, see the [Data Schema Cheatsheet](https://docs.swmansion.com/TypeGPU/reference/data-schema-cheatsheet).

## Structs

Values of different types can be grouped into structs.

```

import * as d from 'typegpu/data';

const Boid = d.struct({

  position: d.vec3u,

  velocity: d.vec3f,

  color: d.vec4f,

  isActive: d.bool,

});

type Boid = d.Infer<typeof Boid>;

type Boid = {

    position: d.v3u;

    velocity: d.v3f;

    color: d.v4f;

    isActive: boolean;

}

const boid: Boid = {

  position: d.vec3u(0, 0, 0),

  velocity: d.vec3f(1, 0.5, 0.5),

  color: d.vec4f(1.0, 0.2, 0.3, 1.0),

  isActive: true,

};
```

You can also use the struct schema as a constructor that type-checks the object literal and provides autocomplete.

```

const boid = Boid({

  position: d.vec3u(0, 0, 0),

  velocity: d.vec3f(1, 0.5, 0.5),

  color: d.vec4f(1.0, 0.2, 0.3, 1.0),

  isAct

isActive

});
```

Struct schemas adjust the padding and alignment automatically, so that they comply with WebGPU’s memory alignment rules.
It is also possible to override default byte alignment and size for particular fields via the `align` and `size ` functions.

```

const Boid = d.struct({

  position: d.align(32, d.vec3u), // Aligned to multiples of 32 bytes

  velocity: d.vec3f,

  color: d.vec4f,

  isActive: d.size(8, d.bool), // Has a minimum size of 8 bytes

});
```

## Arrays

To define arrays of known constant length, use the `d.arrayOf` function. It accepts as arguments the array’s elements data type constructor and the length of the array.

```

const RecentResults = d.arrayOf(d.f32, 4);

type RecentResults = d.Infer<typeof RecentResults>;

type RecentResults = number[]

const recentResults: RecentResults = [\
\
  1, 0, 0.5, 20\
\
];
```---
url: "https://docs.swmansion.com/TypeGPU/fundamentals/functions/"
title: "Functions | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/fundamentals/functions/#_top)

# Functions

TypeGPU allows writing shaders by composing typed functions, which are special wrappers around WGSL code.
These functions can reference outside resources, like other user-defined or helper functions, buffers, bind group layouts etc.

## Creating a function

Functions are constructed by first defining their shells, which specify their inputs and outputs.
Then the actual WGSL implementation is passed in as an argument to a shell invocation. If the code string is a template literal, you can omit the parentheses, which may result in a more compact Biome/Prettier formatting.

The following code defines a function that accepts one argument and returns one value.

```

const getGradientColor = tgpu['~unstable']

  .fn([d.f32], d.vec4f)(/* wgsl */ `(ratio: f32) -> vec4f {

    let color = mix(vec4f(0.769, 0.392, 1.0, 1), vec4f(0.114, 0.447, 0.941, 1), ratio);

    return color;

  }`);

// or

const getGradientColor = tgpu['~unstable']

  .fn([d.f32], d.vec4f) /* wgsl */`(ratio: f32) -> vec4f {

    let color = mix(vec4f(0.769, 0.392, 1.0, 1), vec4f(0.114, 0.447, 0.941, 1), ratio);

    return color;

  };
```

If you’re using Visual Studio Code, you can use an [extension](https://marketplace.visualstudio.com/items?itemName=ggsimm.wgsl-literal) that brings syntax highlighting to the code fragments marked with `/* wgsl */` comments.

## External resources

Functions can use external resources passed inside a record via the `$uses` method.
Externals can be any value or TypeGPU resource that can be resolved to WGSL (functions, buffer usages, slots, accessors, constants, variables, declarations, vectors, matrices, textures, samplers etc.).

```

const getBlue = tgpu['~unstable'].fn([], d.vec4f)`() -> vec4f {

  return vec4f(0.114, 0.447, 0.941, 1);

}`;

const purple = d.vec4f(0.769, 0.392, 1.0, 1);

const getGradientColor = tgpu['~unstable']

  .fn([d.f32], d.vec4f)`(ratio: f32) -> vec4f {

    let color = mix(purple, getBlue(), ratio);

    return color;

  }

  `.$uses({ purple, getBlue });
```

The `getGradientColor` function, when resolved to WGSL, includes the definitions of all used external resources:

```

fn getBlue_1() -> vec4f {

  return vec4f(0.114, 0.447, 0.941, 1);

}

fn getGradientColor_0(ratio: f32) -> vec4f {

  let color = mix(vec4f(0.769, 0.392, 1, 1), getBlue_1(), ratio);

  return color;

}
```

## Entry functions

Defining entry functions is similar to regular ones, but is done through dedicated constructors:

- `tgpu['~unstable'].vertexFn`
- `tgpu['~unstable'].fragmentFn`
- `tgpu['~unstable'].computeFn`

They can be passed to root-defined pipelines and they accept special arguments like builtins ( `d.builtin`) and decorated data ( `d.location`).

```

const mainVertex = tgpu['~unstable'].vertexFn({

  in: { vertexIndex: d.builtin.vertexIndex },

  out: { outPos: d.builtin.position, uv: d.vec2f },

}) /* wgsl */`{

    var pos = array<vec2f, 3>(

      vec2(0.0, 0.5),

      vec2(-0.5, -0.5),

      vec2(0.5, -0.5)

    );

    var uv = array<vec2f, 3>(

      vec2(0.5, 1.0),

      vec2(0.0, 0.0),

      vec2(1.0, 0.0),

    );

    return Out(vec4f(pos[in.vertexIndex], 0.0, 1.0), uv[in.vertexIndex]);

  }`;

const mainFragment = tgpu['~unstable'].fragmentFn({

  in: { uv: d.vec2f },

  out: d.vec4f,

}) /* wgsl */`{

    return getGradientColor((in.uv[0] + in.uv[1]) / 2);

  }`.$uses({ getGradientColor });
```

When entry function inputs or outputs are specified as objects containing builtins and inter-stage variables, the WGSL implementations need to access these arguments as passed in via structs.
TypeGPU schemas for these structs are created automatically by the library and their definitions are included when resolving the functions.
Input values are accessible through the `in` keyword, while the automatically created structs for input and output shall be referenced in implementation as `In` and `Out` respectively.

## Usage in pipelines

Typed functions are crucial for simplified pipeline creation offered by TypeGPU. You can define and run pipelines as follows:

```

const pipeline = root['~unstable']

  .withVertex(mainVertex, {})

  .withFragment(mainFragment, { format: presentationFormat })

  .createPipeline();

pipeline

  .withColorAttachment({

    view: context.getCurrentTexture().createView(),

    clearValue: [0, 0, 0, 0],

    loadOp: 'clear',

    storeOp: 'store',

  })

  .draw(3);
```

The rendering result looks like this:
![rendering result - gradient triangle](https://docs.swmansion.com/TypeGPU/_astro/triangle-result.BPQDYgbg_Z2gQwEN.webp)

You can check out the full example on [our examples page](https://docs.swmansion.com/TypeGPU/examples#example=simple--triangle).---
url: "https://docs.swmansion.com/TypeGPU/fundamentals/resolve/"
title: "Resolve | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/fundamentals/resolve/#_top)

# Resolve

Defining shader schemas and objects in JS/TS has lots of benefits, but having to keep them in sync with the corresponding WGSL code is hard to maintain.
The `tgpu.resolve` API takes in a WGSL template, all TypeGPU schemas that you want to use in the shader, and generates a ready-to-use WGSL bundle.

Here’s an example:

```

import tgpu from 'typegpu';

import * as d from 'typegpu/data';

const LightSource = d

  .struct({

    ambientColor: d.vec3f,

    intensity: d.f32,

  })

  .$name('Source');

// ^ giving the struct an explicit name (optional)

const layout = tgpu

  .bindGroupLayout({

    lightSource: { uniform: LightSource },

    sampling: { sampler: 'filtering' },

    bgTexture: { externalTexture: {} },

  })

  .$idx(0);

// ^ forces code-gen to assign `0` as the group index (optional)

const rawShader = /* wgsl */ `

  @fragment

  fn main(@location(0) uv: vec2f) -> @location(0) vec4f {

    var bgColor = textureSampleBaseClampToEdge(bgTexture, sampling, uv).rgb;

    var newSource: LightSource;

    newSource.ambientColor = (bgColor + lightSource.ambientColor) * factor;

    newSource.intensity = 0.6;

    return vec4f(newSource.ambientColor, newSource.intensity);

  }

`;

const resolved = tgpu.resolve({

  template: rawShader,

  externals: {

    // mapping names in the template to corresponding resources/values

    LightSource,

    factor: d.vec3f(0.4, 0.6, 1.0),

    ...layout.bound,

  },

});
```

Resolved WGSL shader code is as follows:

```

struct Source_0 {

  ambientColor: vec3f,

  intensity: f32,

}

@group(0) @binding(0) var<uniform> lightSource_1: Source_0;

@group(0) @binding(1) var sampling_2: sampler;

@group(0) @binding(2) var bgTexture_3: texture_external;

@fragment

fn main(@location(0) uv: vec2f) -> @location(0) vec4f {

  var bgColor = textureSampleBaseClampToEdge(bgTexture_3, sampling_2, uv).rgb;

  var newSource: Source_0; // identifiers for references are generated based on the chosen naming scheme

  newSource.ambientColor = (bgColor + lightSource_1.ambientColor) * vec3f(0.4, 0.6, 1);

  newSource.intensity = 0.6;

  return vec4f(newSource.ambientColor, newSource.intensity);

}
```

## Template

This optional property of the `tgpu.resolve` function argument is a string containing WGSL code, that is meant to be extended with additional definitions.
It can contain references to objects passed in the `externals` record.

## Externals

This is a record with TypeGPU objects that are to be included in the final resolved shader code.
The values in the mapping are the objects themselves, while the keys are the names by which they are referenced in the template code.
Each object is resolved to its WGSL declaration, which is included in the final shader code.
Moreover each reference to the object in the template is replaced with the name used in its newly generated declaration.

If an object is being referenced only by another TypeGPU object in _externals_, it doesn’t have to be included in the record.
Any passed-in object’s dependencies are automatically resolved and included in the final result.

## Naming scheme

When externals are being resolved, they are given new names based on the specified naming scheme ( `names` parameter).

The default naming scheme is `"random"`. It uses labels assigned to the objects via `.$name("foo")` method or, if they aren’t present, the keys in the _externals_ record.
In this mode labels are later transformed to match the allowed identifier pattern, as well as include some unique suffix to ensure that no identifiers conflict with each other.

Another allowed value of the parameter is `"strict"` which names resolved objects in the WGSL code exactly as they are labeled by the user in JS,
unless there is a name conflict, in which case a suffix is added.
If there is no explicit _.$name_ call, an object is named based on its associated key in _externals_.
This approach makes all of the generated identifiers predictable, but demands that all labels are valid identifiers
and requires explicit naming (via `.$name`) of all objects that aren’t immediate values in the _externals_ record.---
url: "https://docs.swmansion.com/TypeGPU/fundamentals/roots/"
title: "Roots | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/fundamentals/roots/#_top)

# Roots

Roots are responsible for resource allocation and management. Whether you’d like to wrap an existing WebGPU buffer
with a typed shell or create a brand new buffer, roots are the place to start.

You can create a root using the `tgpu.init` function.

```

const root = await tgpu.init();
```

It requests a GPU device with default requirements. An optional parameter
can be passed in with special requirements for the GPU device. If you already have a device that you want to use,
you can pass it into `tgpu.initFromDevice` instead.

```

const root = tgpu.initFromDevice({ device });
```

To retrieve the device that is associated with a root, you can use the `root.device` property.

```

const device = root.device; // => GPUDevice

context.configure({

  device,

  format: presentationFormat,

  alphaMode: 'premultiplied',

});
```

## Creating resources

Every `root.create*` function creates a typed resource.

| Function | Description |
| --- | --- |
| `root.createBuffer` | Creates a typed buffer with a given data-type and, optionally, an initial value. More information in [the next chapter](https://docs.swmansion.com/TypeGPU/fundamentals/buffers). |

## Unwrapping resources

There are times where a typed resource needs to be used by a vanilla WebGPU API. To retrieve the raw
untyped value of a typed resource, use the `root.unwrap` function.

| Function | Description |
| --- | --- |
| `root.unwrap(resource: TgpuBuffer<AnyData>)` | Returns a `GPUBuffer`. |
| `root.unwrap(resource: TgpuBindGroupLayout)` | Returns a `GPUBindGroupLayout`. |
| `root.unwrap(resource: TgpuBindGroup)` | Returns a `GPUBindGroup`. |
| `root.unwrap(resource: TgpuVertexLayout)` | Returns a `GPUVertexBufferLayout`. |

## Destroying resources

Calling `root.destroy()` will destroy all resources created with it.
It will also destroy the underlying WebGPU device, if it wasn’t originally passed in via the `initFromDevice` function.

```

root.destroy(); // <- frees up all the resources
```

## Best practices

Treat roots as their own separate universes, meaning resources created from the same root can interact with each other, while
resources created by seperate roots can have a hard time interacting. This usually means creating just one root at the start
of the program is the safest bet, but there are exceptions.

### If you do not own the GPU device

If you cannot control the lifetime of the GPU device you are to use for computing/rendering, but are instead given the device in a lifecycle hook (e.g., react-native-wgpu),
**you can create a new root each time, as long as you recreate every resource as well.**

```

import React from 'react';

function SceneView() {

  const ref = useWebGPU(({ context, device, presentationFormat }) => {

    const root = tgpu.initFromDevice({ device });

    // create all resources...

  });

  // ...

}
```

### If you pass the GPU device everywhere

It is common practice to pass a `GPUDevice` to classes or functions for them to allocate their required resources. At first glance, this poses a problem when trying to
incorporate TypeGPU, since we would need to pass a root around instead of a device for all functionality that wants to move towards a typed API. **We can create a global mapping**
**between devices and roots to solve this.**

You can copy and paste the utility below that implements a basic global cache for roots.

```

const deviceToRootMap = new WeakMap<GPUDevice, TgpuRoot>();

function getOrInitRoot(device: GPUDevice): TgpuRoot {

  let root = deviceToRootMap.get(device);

  if (!root) {

    root = tgpu.initFromDevice({ device });

    deviceToRootMap.set(device, root);

  }

  return root;

}
```

If you reuse the same `getOrInitRoot` function across code that has to create resources, the root will be shared
across them.

```

class GameObject {

  constructor(device: GPUDevice) {

    const root = getOrInitRoot(device);

    // create all resources...

  }

}
```---
url: "https://docs.swmansion.com/TypeGPU/fundamentals/vertex-layouts/"
title: "Vertex Layouts | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/fundamentals/vertex-layouts/#_top)

# Vertex Layouts

Vertex layouts are much like bind group layouts, in that they define the relationship between shaders and buffers. More precisely, they define what vertex attributes a shader expects, and how they are laid out in the corresponding vertex buffer.

## Creating a vertex layout

To create a vertex layout, use the `tgpu.vertexLayout` function. It takes an array schema constructor, i.e., a function that returns an array schema given the number of elements to render (vertices/instances). To determine what each element of the array corresponds to, you can pass an optional `stepMode` argument, which can be either `vertex` (default) or `instance`.

```

import tgpu from 'typegpu';

import * as d from 'typegpu/data';

const ParticleGeometry = d.struct({

  tilt: d.f32,

  angle: d.f32,

  color: d.vec4f,

});

const geometryLayout = tgpu

  .vertexLayout((n: number) => d.arrayOf(ParticleGeometry, n), 'instance');
```

## Utilizing loose schemas with vertex layouts

If the vertex buffer is not required to function as a storage or uniform buffer, a _loose schema_ may be used to define the vertex data layout. Loose schemas are not subject to alignment restrictions and allow the use of various [vertex formats](https://www.w3.org/TR/webgpu/#vertex-formats).

To define a loose schema:

- Use `d.unstruct` instead of `d.struct`.
- Use `d.disarrayOf` instead of `d.arrayOf`.

Within a loose schema, both standard data types and vertex formats can be utilized.

```

const LooseParticleGeometry = d.unstruct({

  tilt: d.f32,

  angle: d.f32,

  // four 8-bit values, unsigned & normalized

  // i.e., four integers in (0, 255) represent four floats in the range of (0.0, 1.0)

  color: d.unorm8x4,

});
```

The size of `LooseParticleGeometry` will be 12 bytes, compared to 32 bytes of `ParticleGeometry`. This can be useful when you’re working with large amounts of vertex data and want to save memory.

## Using vertex layouts

You can utilize [`root.unwrap`](https://docs.swmansion.com/TypeGPU/fundamentals/roots) to get the raw `GPUVertexBufferLayout` from a typed vertex layout. It will automatically calculate the stride and attributes for you, according to the vertex layout you provided.

```

const ParticleGeometry = d.struct({

  tilt: d.location(0, d.f32),

  angle: d.location(1, d.f32),

  color: d.location(2, d.vec4f),

});

const geometryLayout = tgpu

  .vertexLayout((n: number) => d.arrayOf(ParticleGeometry, n), 'instance');

const geometry = root.unwrap(geometryLayout);

console.log(geometry);

//{

//  "arrayStride": 32,

//  "stepMode": "instance",

//  "attributes": [\
\
//    {\
\
//      "format": "float32",\
\
//      "offset": 0,\
\
//      "shaderLocation": 0\
\
//    },\
\
//    {\
\
//      "format": "float32",\
\
//      "offset": 4,\
\
//      "shaderLocation": 1\
\
//    },\
\
//    {\
\
//      "format": "float32x4",\
\
//      "offset": 16,\
\
//      "shaderLocation": 2\
\
//    }\
\
//  ]

//}
```

This will return a `GPUVertexBufferLayout` that can be used when creating a render pipeline.

```

const renderPipeline = device.createRenderPipeline({

  layout: device.createPipelineLayout({

    bindGroupLayouts: [root.unwrap(bindGroupLayout)],

  }),

  primitive: {

    topology: 'triangle-strip',

  },

  vertex: {

    module: renderShader,

    buffers: [\
\
      {\
\
        arrayStride: 32,\
\
        stepMode: 'instance',\
\
        attributes: [\
\
          {\
\
            format: 'float32',\
\
            offset: 0,\
\
            shaderLocation: 0,\
\
          },\
\
          {\
\
            format: 'float32',\
\
            offset: 4,\
\
            shaderLocation: 1,\
\
          },\
\
          {\
\
            format: 'float32x4',\
\
            offset: 16,\
\
            shaderLocation: 2,\
\
          },\
\
        ],\
\
      },\
\
    ],

    buffers: [root.unwrap(geometryLayout)],

  },

  fragment: {

    ...

  },

});
```

Loose schemas can be interpreted in multiple ways within a shader. However, for convenience, they can be resolved to their default WGSL representation.

```

const LooseParticleGeometry = d.unstruct({

  tilt: d.location(0, d.f32),

  angle: d.location(1, d.f32),

  color: d.location(2, d.unorm8x4),

});

const sampleShader = `

  @vertex

  fn main(particleGeometry: LooseParticleGeometry) -> @builtin(position) pos: vec4f {

    return vec4f(

      particleGeometry.tilt,

      particleGeometry.angle,

      particleGeometry.color.rgb,

      1.0

    );

  }

`;

const wgslDefinition = tgpu.resolve({

  template: sampleShader,

  externals: { LooseParticleGeometry }

});

console.log(wgslDefinition);

// struct LooseParticleGeometry_0 {

//   @location(0) tilt: f32,

//   @location(1) angle: f32,

//   @location(2) color: vec4f,

// }

//

// @vertex

// fn main(particleGeometry: LooseParticleGeometry_0) -> @builtin(position) pos: vec4f {

//   return vec4f(

//     particleGeometry.tilt,

//     particleGeometry.angle,

//     particleGeometry.color.rgb,

//     1.0

//   );

// }
```---
url: "https://docs.swmansion.com/TypeGPU/getting-started/"
title: "Getting Started | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/getting-started/#_top)

# Getting Started

## Installing locally

Install TypeGPU using the package manager of your choice.

- [npm](https://docs.swmansion.com/TypeGPU/getting-started/#tab-panel-0)
- [pnpm](https://docs.swmansion.com/TypeGPU/getting-started/#tab-panel-1)
- [yarn](https://docs.swmansion.com/TypeGPU/getting-started/#tab-panel-2)

```

npm install typegpu
```

```

pnpm add typegpu
```

```

yarn add typegpu
```

You can then import it in JavaScript/TypeScript code.

```

import tgpu from 'typegpu';

// ...
```

## Live Examples

Our [live examples](https://docs.swmansion.com/TypeGPU/examples) showcase many use-cases of TypeGPU. Feel free to check them out! You can also open each of them on StackBlitz in order to edit the code and see the preview update live.

## StackBlitz

You can play with TypeGPU right in the browser using our [StackBlitz example](https://stackblitz.com/edit/typegpu-example?file=src%2Fmain.ts).

## Troubleshooting

WebGPU types are not available

If WebGPU types, such as `GPUDevice` or `GPUBuffer`, are not recognized in your project, make sure to install the
officially maintained [@webgpu/types](https://www.npmjs.com/package/@webgpu/types) npm package.

- [npm](https://docs.swmansion.com/TypeGPU/getting-started/#tab-panel-3)
- [pnpm](https://docs.swmansion.com/TypeGPU/getting-started/#tab-panel-4)
- [yarn](https://docs.swmansion.com/TypeGPU/getting-started/#tab-panel-5)

```

npm install --save-dev @webgpu/types
```

```

pnpm add -D @webgpu/types
```

```

yarn add -D @webgpu/types
```

Then in `tsconfig.json`:

```

{

  // ...

  "compilerOptions": {

    // ...

    "types": ["@webgpu/types"]

  }

}
```

Or you can use `typeRoots`:

```

{

  "compilerOptions": {

    "typeRoots": ["./node_modules/@webgpu/types", "./node_modules/@types"]

  }

}
```

If you encounter any other issues, make sure to look into the rest of our docs, as well as the [WebGPU](https://www.w3.org/TR/webgpu/) or the [react-native-wgpu](https://github.com/wcandillon/react-native-webgpu) documentations. For any further questions, you can contact us via the [Software Mansion Community Discord](https://discord.gg/8jpfgDqPcM) or on [GitHub](https://github.com/software-mansion/TypeGPU).---
url: "https://docs.swmansion.com/TypeGPU/integration/react-native/"
title: "React Native | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/integration/react-native/#_top)

# React Native

Thanks to the [react-native-wgpu](https://github.com/wcandillon/react-native-webgpu) package,
WebGPU and TypeGPU can be used in React Native applications,
giving easy access to the device’s GPU rendering and computing capabilities.

## Example project

You can check out the [typegpu-rn-examples](https://github.com/software-mansion-labs/typegpu-rn-examples) project,
showcasing a few examples from our _live examples_ page in a simple mobile application.

![example – 3d fish](https://docs.swmansion.com/TypeGPU/_astro/example-fish.CFuEfjBd.png)![example – fluid 1](https://docs.swmansion.com/TypeGPU/_astro/example-fluid-1.BxZPdSxj.png)![example – fluid 2](https://docs.swmansion.com/TypeGPU/_astro/example-fluid-2.C5xJxJ4u.png)

## Setup

To use TypeGPU in your React Native application, install the following packages:

```

npm install react-native-wgpu

npm install typegpu
```

If you use TypeScript, then it’s also recommended to install WebGPU types:

```

npm i --save-dev @webgpu/types
```

```

{

  "compilerOptions": {

    "typeRoots": [\
\
      "./node_modules/@webgpu/types"\
\
    ]

  },

}
```

If you want to be able to use the TGSL functions feature of TypeGPU (JS functions transpiled to WGSL), you need to install the [unplugin-typegpu](https://www.npmjs.com/package/unplugin-typegpu) package.

```

npm install --save-dev unplugin-typegpu
```

And enable it in your project.

```

npm exec expo customize
```

Select `babel.config.js` and add `unplugin-typegpu/babel` to the list of plugins in the config file.

```

module.exports = (api) => {

  api.cache(true);

  return {

    presets: ['babel-preset-expo'],

    plugins: ['unplugin-typegpu/babel'],

  };

};
```

After adding the plugin it might be necessary to clear the Metro cache.

```

npm exec expo --clear
```

React Native WebGPU is not yet supported by Expo Go.
If you previously used it for running the application, it is necessary to execute the `expo prebuild` command.

```

npm exec expo prebuild
```

Remember to install native dependencies.

```

cd ios && pod install && cd ..
```

To run React Native WebGPU on the iOS simulator, you need to disable the Metal validation API.
In _Edit Scheme_ uncheck _Metal Validation_.

## Hello world example

If you want to quickly test if the installation was successful, here’s a simple example component, rendering a blue triangle,
that you can use in your app:

```

import { useEffect } from 'react';

import { Canvas, useDevice, useGPUContext } from 'react-native-wgpu';

import tgpu from 'typegpu';

import * as d from 'typegpu/data';

const mainVertex = tgpu['~unstable'].vertexFn({

  in: { vertexIndex: d.builtin.vertexIndex },

  out: { outPos: d.builtin.position, uv: d.vec2f },

})/* wgsl */ `{

  var pos = array<vec2f, 3>(vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));

  var uv = array<vec2f, 3>(vec2(0.5, 1.0), vec2(0.0, 0.0), vec2(1.0, 0.0));

  return Out(vec4f(pos[in.vertexIndex], 0.0, 1.0), uv[in.vertexIndex]);

}`;

const blue = d.vec4f(0.114, 0.447, 0.941, 1);

const mainFragment = tgpu['~unstable'].fragmentFn({

  in: { uv: d.vec2f },

  out: d.vec4f,

})`{ return blue; }`.$uses({ blue });

export function Triangle() {

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  const { device = null } = useDevice();

  const root = device ? tgpu.initFromDevice({ device }) : null;

  const { ref, context } = useGPUContext();

  useEffect(() => {

    if (!root || !device || !context) {

      return;

    }

    context.configure({

      device: device,

      format: presentationFormat,

      alphaMode: 'premultiplied',

    });

    root['~unstable']

      .withVertex(mainVertex, {})

      .withFragment(mainFragment, { format: presentationFormat })

      .createPipeline()

      .withColorAttachment({

        view: context.getCurrentTexture().createView(),

        clearValue: [0, 0, 0, 0],

        loadOp: 'clear',

        storeOp: 'store',

      })

      .draw(3);

    context.present();

  }, [root, device, context, presentationFormat]);

  return (

    <>

      <Canvas />

      <Canvas ref={ref} style={{ aspectRatio: 1 }} transparent />

    </>

  );

}
```

## Further reading

For more information about React Native WebGPU, please refer to the [react-native-wgpu](https://github.com/wcandillon/react-native-webgpu) documentation.---
url: "https://docs.swmansion.com/TypeGPU/integration/webgpu-interoperability/"
title: "WebGPU Interoperability | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/integration/webgpu-interoperability/#_top)

# WebGPU Interoperability

TypeGPU is built in a way that allows you to pick and choose the primitives you need, incrementally adopt them into your project and have a working app at each step
of the process. We go to great lengths to ensure that turning even a single buffer into our typed variant improves the developer experience, and does not require changes
to the rest of the codebase.

The **non-contagious** nature of TypeGPU means that ejecting out, in case raw WebGPU access is required, can be done on a very granular level.

## Points of integration

### Accessing underlying WebGPU resources

Since TypeGPU is a very thin abstraction over WebGPU, there is a 1-to-1 mapping between most typed resources
and the raw WebGPU resources used underneath.

```

const layout = tgpu.bindGroupLayout(...);

//    ^? TgpuBindGroupLayout<...>

const rawLayout = root.unwrap(layout); // => GPUBindGroupLayout
```

```

const numbersBuffer = root.createBuffer(d.f32).$usage('uniform');

//    ^? TgpuBuffer<d.F32> & UniformFlag

const rawNumbersBuffer = root.unwrap(numbersBuffer); // => GPUBuffer

// Operations on `rawNumbersBuffer` and `numbersBuffer` are shared, because

// they are essentially the same resource.
```

```

const bindGroup = root.createBindGroup(layout, { ... });

//    ^? TgpuBindGroup<...>

const rawBindGroup = root.unwrap(bindGroup); // => GPUBindGroup
```

### Plugging WebGPU resources into typed APIs.

Many TypeGPU APIs accept either typed resources, or their untyped equivalent.

#### Buffers

Instead of passing an initial value to `root.createBuffer`, we can pass it a raw WebGPU buffer and interact with it through
TypeGPU’s APIs.

```

const rawBuffer = device.createBuffer({

  size: (Float32Array.BYTES_PER_ELEMENT * 4) * 2, // (xyz + padding) * 2

  usage: GPUBufferUsage.COPT_DST | GPUBufferUsage.UNIFORM,

});

const Schema = d.arrayOf(d.vec3f, 2);

const typedBuffer = root.createBuffer(Schema, rawBuffer);

// Updates `rawBuffer` underneath.

typedBuffer.write([d.vec3f(1, 2, 3), d.vec3f(4, 5, 6)]);

// Interpreting the raw bytes in `rawBuffer` as JS values

const values = await typedBuffer.read(); // => d.v3f[]
```

#### Bind Group Layouts

When creating typed bind groups from a layout, entries can be populated with equivalent raw WebGPU resources.

```

const layout = tgpu.bindGroupLayout({

  a: { uniform: d.f32 },

  b: { uniform: d.u32 },

});

const aBuffer = root.createBuffer(d.f32, 0.5).$usage('uniform');

//    ^? TgpuBuffer<d.F32> & UniformFlag

const bBuffer = root.device.createBuffer({

  size: Uint32Array.BYTES_PER_ELEMENT,

  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,

});

// ^? GPUBuffer

const bindGroup = root.createBindGroup(layout, {

  a: aBuffer, // Validates if the buffers holds the right data and usage on the type level.

  b: bBuffer, // Allows the raw buffer to pass through.

});
```

## Incremental adoption recipes

To deliver on the promise of interoperability, below are the small code changes necessary to adopt TypeGPU, and the benefits gained at each step.

Since adoption can start growing from many points in a WebGPU codebase, feel free to choose whichever path suits your use-case the most:

- [Starting at buffers](https://docs.swmansion.com/TypeGPU/integration/webgpu-interoperability/#starting-at-buffers)
- [Starting at bind group layouts](https://docs.swmansion.com/TypeGPU/integration/webgpu-interoperability/#starting-at-bind-group-layouts)

### Starting at buffers

#### Define a schema for a buffer’s contents

```

const Schema = d.arrayOf(d.vec3f, 2);

const rawBuffer = device.createBuffer({

  size: (Float32Array.BYTES_PER_ELEMENT * 4) * 2, // (xyz + padding) * 2

  size: d.sizeOf(Schema),

  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,

  mappedAtCreation: true,

});

new Float32Array(rawBuffer.getMappedRange()).set([\
\
  0, 1, 2, /* padding */ 0,\
\
  3, 4, 5, /* padding */ 0,\
\
]);

rawBuffer.unmap();
```

Benefits gained:

- **Increased context** \- a data-type schema allows developers to quickly determine what a buffer is supposed to
contain, without the need to jump around the codebase.
- **Automatic sizing** \- schemas understand WebGPU memory layout rules, therefore can calculate the required size
of a buffer.

#### Wrap the buffer in a typed shell

```

const Schema = d.arrayOf(d.vec3f, 2);

const rawBuffer = device.createBuffer({

  size: d.sizeOf(Schema),

  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,

  mappedAtCreation: true,

});

const buffer = root

  .createBuffer(Schema, rawBuffer)

  .$usage('storage', 'vertex');

buffer.write([d.vec3f(0, 1, 2), d.vec3f(3, 4, 5)]);

new Float32Array(rawBuffer.getMappedRange()).set([\
\
  0, 1, 2, /* padding */ 0,\
\
  3, 4, 5, /* padding */ 0,\
\
]);

rawBuffer.unmap();
```

Benefits gained:

- **Typed I/O** \- typed buffers have `.write` and `.read` methods that accept/return properly typed
JavaScript values that match that buffer’s schema. Trying to write anything other than an array
of `vec3f` will result in a type error, surfaced immediately by the IDE and at build time.
- **Automatic padding** \- TypeGPU understands how to translate JS values into binary and back,
adhering to memory layout rules. This reduces the room for error, and no longer requires knowledge
about `vec3f` s having to be aligned to multiples of 16 bytes.

#### Let TypeGPU create the buffer

```

const Schema = d.arrayOf(d.vec3f, 2);

const rawBuffer = device.createBuffer({

  size: d.sizeOf(Schema),

  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,

  mappedAtCreation: true,

});

const buffer = root

  .createBuffer(Schema, rawBuffer)

  .createBuffer(Schema, [d.vec3f(0, 1, 2), d.vec3f(3, 4, 5)])

  .$usage('storage', 'vertex');

const rawBuffer = root.unwrap(buffer);

wrappedBuffer.write([d.vec3f(0, 1, 2), d.vec3f(3, 4, 5)]);

rawBuffer.unmap();
```

Benefits gained:

- **Automatic flags** \- buffer flags can be inferred based on the usages passed into `.$usage`. That way they can be consistent both on the type-level, as well as at runtime.
- **Initial value** \- an optional initial value can be passed in, which takes care of mapping the buffer at creation, and unmapping it.

### Starting at bind group layouts

#### Replace the WebGPU API call with a typed variant

```

const rawLayout = device.createBindGroupLayout({

  entries: [\
\
    // ambientColor\
\
    {\
\
      binding: 0,\
\
      visibility: GPUShaderStage.COMPUTE,\
\
      buffer: {\
\
        type: 'uniform',\
\
      },\
\
    },\
\
    // intensity\
\
    {\
\
      binding: 2,\
\
      visibility: GPUShaderStage.COMPUTE,\
\
      buffer: {\
\
        type: 'uniform',\
\
      },\
\
    },\
\
  ],

});

const layout = tgpu.bindGroupLayout({

  ambientColor: { uniform: d.vec3f }, // #0 binding

  _: null, // #1 skipped!

  intensity: { uniform: d.f32 }, // #2 binding

});

const rawLayout = root.unwrap(layout);
```

Benefits gained:

- **Increased context** \- replacing indices with named keys ( `'ambientColor'`, `'intensity'`, …) and providing data types reduces the need to jump around the codebase to
find a layout’s semantic meaning.
- **Good defaults** \- binding indices are inferred automatically based on the order of properties in the descriptor, starting from `0`. Properties with the
value `null` are skipped. The visibility is assumed based on the type of resource. Can be explicitly limited using the optional `visibility` property.

#### Create bind groups from typed layouts

```

const rawBindGroup = device.createBindGroup({

  layout: rawLayout,

  entries: [\
\
    // ambientColor\
\
    {\
\
      binding: 0,\
\
      resource: { buffer: rawFooBuffer },\
\
    },\
\
    // intensity\
\
    {\
\
      binding: 2,\
\
      resource: { buffer: rawBarBuffer },\
\
    },\
\
  ],

});

const bindGroup = root.createBindGroup(layout, {

  ambientColor: ambientColorBuffer,

  intensity: intensityBuffer,

});

const rawBindGroup = root.unwrap(bindGroup);
```

Benefits gained:

- **Reduced fragility** \- no longer susceptible to shifts in binding indices, as the resources are associated with a named key instead.
- **Autocomplete** \- the IDE can suggest what resources need to be passed in, and what their data types should be.
- **Static validation** \- when the layout gains a new entry, or the kind of resource it holds changes, the IDE and build system will catch
it before the error surfaces at runtime. When using typed buffers, the validity of the data-type and usage is also validated on the type level.

#### Inject shader code

```

const layout = tgpu.bindGroupLayout({

  ambientColor: { uniform: d.vec3f }, // #0 binding

  _: null, // #1 skipped!

  intensity: { uniform: d.f32 }, // #2 binding

});

}).$idx(0); // <- forces code-gen to assign `0` as the group index.

const rawShader = /* wgsl */ `

  @group(0) @binding(0) var<uniform> ambientColor: vec3f;

  @group(0) @binding(1) var<uniform> intensity: f32;

  @fragment

  fn main() -> @location(0) vec4f {

    return vec4f(ambientColor * intensity, 1.);

  }

`;

const module = device.createShaderModule({

  code: rawShader,

  code: tgpu.resolve({

    template: rawShader,

    // Matching up shader variables with layout entries:

    //   'nameInShader': layout.bound.nameInLayout,

    //

    externals: {

      ambientColor: layout.bound.ambientColor,

      intensity: layout.bound.intensity,

    },

    // or just:

    // externals: { ...layout.bound },

  }),

});
```

Benefits gained:

- **Reduced fragility** \- binding indices are now being handled end-to-end by TypeGPU, leaving human-readable keys
as the way to connect the shader with JavaScript.
- **Single source of truth** \- typed bind group layouts not only describe JS behavior, but also WGSL behavior. This
allows [`tgpu.resolve`](https://docs.swmansion.com/TypeGPU/fundamentals/resolve) to generate the appropriate WGSL code. Definitions of structs used as part of the layout will
also be included in the returned shader code.---
url: "https://docs.swmansion.com/TypeGPU/integration/wesl-interoperability/"
title: "WESL Interoperability | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/integration/wesl-interoperability/#_top)

# WESL Interoperability

We are working with [WESL](https://wesl-lang.dev/), a community standard for enhanced WGSL, to enable
hybrid programs that mix-and-match between _shader-centric_ and _host-centric_ approaches. Shaders written in
WGSL or [WESL](https://wesl-lang.dev/) can be reflected into JS/TS as TypeGPU definitions, with proper types
generated on the fly.

- ✨ Take advantage of type-safe buffers while keeping your shaders in WESL
- ⚔️ Eliminate manual byte alignment and padding

## Setting up

This functionality is provided as an extension to [`wesl-plugin`](https://wesl-lang.dev/docs/Getting-Started-JavaScript).
Consult their documentation on what to install, and how to use it with your bundler of choice.

Our official [`wesl-ext-typepgu`](https://github.com/software-mansion-labs/wesl-ext-typegpu) package extends the capabilities of `wesl-plugin`.
Install it before proceeding.

- [npm](https://docs.swmansion.com/TypeGPU/integration/wesl-interoperability/#tab-panel-6)
- [pnpm](https://docs.swmansion.com/TypeGPU/integration/wesl-interoperability/#tab-panel-7)
- [yarn](https://docs.swmansion.com/TypeGPU/integration/wesl-interoperability/#tab-panel-8)

```

npm add --save-dev wesl-ext-typegpu
```

```

pnpm add -D wesl-ext-typegpu
```

```

yarn add -D wesl-ext-typegpu
```

Next up, reference the extension in your bundler’s configuration. Below is an example using Vite.

```

import { defineConfig } from "vite";

import weslPlugin from "wesl-plugin/vite";

import { linkBuildExtension } from "wesl-plugin";

import { typegpuExtension } from "wesl-ext-typegpu";

export default defineConfig({

  plugins: [weslPlugin({ extensions: [linkBuildExtension, typegpuExtension] })],

});
```

And finally, to let the TypeScript language server know where to look for typing of the
.wgsl/.wesl you’re importing, change the following in your tsconfig.json:

```

{

  // ...

  "include": [/* all other files you're including */, ".wesl/**/*"]

  // ...

}
```

## Reflection

Let’s say we have to following shader program, split across two files.

```

struct BoidState {

  position: vec3f,

  velocity: vec3f,

}

struct Fish {

  kind: u32,

  state: BoidState,

}
```

```

use package::shared::Fish;

@group(0) @binding(0) var<storage, read_write> fish: array<Fish>;

@compute @workgroup_size(32)

fn main() {

  // ...

}
```

Given a shader written in WGSL/WESL, we can use the `?typegpu` query parameter to import
reified references to any struct definition.

```

// Importing a WGSL struct into JS

import { Fish } from './shaders/shared.wesl?typegpu';

const FishArray = (n: number) => d.arrayOf(Fish, n);

const buffer = root.createBuffer(FishArray(512)).$usage('storage');

const buffer: TgpuBuffer<d.WgslArray<d.WgslStruct<{

    kind: d.U32;

    state: d.WgslStruct<{

        position: d.Vec3f;

        velocity: d.Vec3f;

    }>;

}>>> & StorageFlag

// Updating the 123rd fish's position

buffer.writePartial([\
\
  {\
\
    idx: 123,\
\
    value: {\
\
      state: {\
\
        posit\
\
position\
\
      },\
\
    }\
\
  }\
\
]);
```---
url: "https://docs.swmansion.com/TypeGPU/integration/working-with-wgpu-matrix/"
title: "Working with wgpu-matrix | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/integration/working-with-wgpu-matrix/#_top)

# Working with wgpu-matrix

The [wgpu-matrix](https://github.com/greggman/wgpu-matrix) library provides utilities for matrix and vector math, which is essential for graphics programming.
It is designed from the ground up to be compatible with WebGPU, and TypeGPU works with it seamlessly.

## Using wgpu-matrix functions with TypeGPU primitives

Because elements in TypeGPU vectors and matrices can be accessed with the `[]` operator, they can be processed by `wgpu-matrix` utilities.
For example, you can create a vector and normalize it like this:

```

import * as d from 'typegpu/data';

import { vec2 } from 'wgpu-matrix';

const v = d.vec2f(1, 2);

vec2.normalize(v, v);

console.log(v.x); // 0.447..

console.log(v.y); // 0.894..
```

If you wanted to initialize a matrix as an identity matrix, you could do it like this:

```

import * as d from 'typegpu/data';

import { mat4 } from 'wgpu-matrix';

const m = mat4.identity(d.mat4x4f()); // returns a mat4x4f

console.log(m[0]); // 1
```

## Migration tips

Since you can use TypeGPU primitives directly with `wgpu-matrix` functions, the migration process is relatively simple.
Let’s look at some examples:

### Chained in-place operations on a matrix

If your code creates a matrix and then applies some operations to it in-place, you can use TypeGPU primitives directly:

```

const m = mat4.create();

const m = mat4x4f();

mat4.identity(m);                   // m = identity

mat4.translate(m, [1, 2, 3], m);    // m *= translation([1, 2, 3])

mat4.rotateX(m, Math.PI * 0.5, m);  // m *= rotationX(Math.PI * 0.5)

mat4.scale(m, [1, 2, 3], m);        // m *= scaling([1, 2, 3])
```

### Creating a matrix using a function

If your code creates a matrix using a function, for example:

```

const fov = 60 * Math.PI / 180

const aspect = width / height;

const near = 0.1;

const far = 1000;

const perspective = mat4.perspective(fov, aspect, near, far);
```

You can pass a TypeGPU matrix as the destination argument:

```

const m = mat4x4f();

const fov = 60 * Math.PI / 180

const aspect = width / height;

const near = 0.1;

const far = 1000;

const perspective = mat4.perspective(fov, aspect, near, far);

mat4.perspective(fov, aspect, near, far, m);
```---
url: "https://docs.swmansion.com/TypeGPU/reference/data-schema-cheatsheet/"
title: "Data Schema Cheatsheet | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/reference/data-schema-cheatsheet/#_top)

# Data Schema Cheatsheet

## Numeric data types

| Schema | JavaScript | WGSL |
| --- | --- | --- |
| ```<br>import { f32 } from 'typegpu/data';<br>``` | `number` | `f32` |
| ```<br>import { i32 } from 'typegpu/data';<br>``` | `number` | `i32` |
| ```<br>import { u32 } from 'typegpu/data';<br>``` | `number` | `u32` |
| ```<br>import { bool } from 'typegpu/data';<br>``` | `boolean` | `bool` |

## Vector and matrix types

| Schema | Value constructors | WGSL equivalents |
| --- | --- | --- |
| `vec2u` | - `vec2u(x: number, y: number)`<br>- `vec2u(xy: number)`<br>- `vec2u()` | vec2u, vec2<u32> |
| `vec2f` | - `vec2f(x: number, y: number)`<br>- `vec2f(xy: number)`<br>- `vec2f()` | vec2f, vec2<f32> |
| `vec2i` | - `vec2i(x: number, y: number)`<br>- `vec2i(xy: number)`<br>- `vec2i()` | vec2i, vec2<i32> |
| `vec2h` | - `vec2h(x: number, y: number)`<br>- `vec2h(xy: number)`<br>- `vec2h()` | vec2h, vec2<f16> |
| `vec3u` | - `vec3u(x: number, y: number, z: number)`<br>- `vec3u(xyz: number)`<br>- `vec3u()` | vec3u, vec3<u32> |
| `vec3f` | - `vec3f(x: number, y: number, z: number)`<br>- `vec3f(xyz: number)`<br>- `vec3f()` | vec3f, vec3<f32> |
| `vec3i` | - `vec3i(x: number, y: number, z: number)`<br>- `vec3i(xyz: number)`<br>- `vec3i()` | vec3i, vec3<i32> |
| `vec3h` | - `vec3h(x: number, y: number, z: number)`<br>- `vec3h(xyz: number)`<br>- `vec3h()` | vec3h, vec3<f16> |
| `vec4u` | - `vec4u(x: number, y: number, z: number, w: number)`<br>- `vec4u(xyzw: number)`<br>- `vec4u()` | vec4u, vec4<u32> |
| `vec4f` | - `vec4f(x: number, y: number, z: number, w: number)`<br>- `vec4f(xyzw: number)`<br>- `vec4f()` | vec4f, vec4<f32> |
| `vec4i` | - `vec4i(x: number, y: number, z: number, w: number)`<br>- `vec4i(xyzw: number)`<br>- `vec4i()` | vec4i, vec4<i32> |
| `vec4h` | - `vec4h(x: number, y: number, z: number, w: number)`<br>- `vec4h(xyzw: number)`<br>- `vec4h()` | vec4h, vec4<f16> |
| `mat2x2f` | - `mat2x2f(...elements: number[])`<br>- `mat2x2f(...columns: vec2f[])`<br>- `mat2x2f()` | mat2x2f, mat2x2<f32> |
| `mat3x3f` | - `mat3x3f(...elements: number[])`<br>- `mat3x3f(...columns: vec3f[])`<br>- `mat3x3f()` | mat3x3f, mat3x3<f32> |
| `mat4x4f` | - `mat4x4f(...elements: number[])`<br>- `mat4x4f(...columns: vec4f[])`<br>- `mat4x4f()` | mat4x4f, mat4x4<f32> |---
url: "https://docs.swmansion.com/TypeGPU/tooling/tgpu-gen/"
title: "Generator CLI | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/tooling/tgpu-gen/#_top)

# Generator CLI

TypeGPU Generator (tgpu-gen) is a CLI companion tool that transforms WGSL code files into
matching TypeGPU definitions. It can be used for integrating TypeGPU into established WebGPU projects, or automating the migration process.

- ✨ Generate TypeGPU definitions from WGSL shaders
- 👀 Continuously watch for changes in WGSL files and update the generated definitions
- 🌲 Specify input and output using glob patterns
- 🎯 Choose the output extension and CJS or ESM format

## Installation

You can use it directly through `npx`:

```

npx tgpu-gen path/to/shader.wgsl
```

Or install it globally:

```

npm install -g tgpu-gen

tgpu-gen path/to/shader.wgsl
```

## Example

Let’s assume the following directory structure:

- DirectorycomputeBoids


- Directoryshaders


- updateSprites.wgsl
- sprite.wgsl

- main.ts

This is a simple project that contains two WGSL shaders ( `updateSprites.wgsl` and `sprite.wgsl`) and a TypeScript file ( `main.ts`).
The example WGSL shaders can be found on the [WebGPU Samples repository](https://github.com/webgpu/webgpu-samples/tree/main/sample/computeBoids).

Here are the contents of the shader files:

- [updateSprites.wgsl](https://docs.swmansion.com/TypeGPU/tooling/tgpu-gen/#tab-panel-9)
- [sprite.wgsl](https://docs.swmansion.com/TypeGPU/tooling/tgpu-gen/#tab-panel-10)

Click to see the content

```

struct Particle {

  pos : vec2f,

  vel : vec2f,

}

struct SimParams {

  deltaT : f32,

  rule1Distance : f32,

  rule2Distance : f32,

  rule3Distance : f32,

  rule1Scale : f32,

  rule2Scale : f32,

  rule3Scale : f32,

}

struct Particles {

  particles : array<Particle>,

}

@binding(0) @group(0) var<uniform> params : SimParams;

@binding(1) @group(0) var<storage, read> particlesA : Particles;

@binding(2) @group(0) var<storage, read_write> particlesB : Particles;

// https://github.com/austinEng/Project6-Vulkan-Flocking/blob/master/data/shaders/computeparticles/particle.comp

@compute @workgroup_size(64)

fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3u) {

  var index = GlobalInvocationID.x;

  var vPos = particlesA.particles[index].pos;

  var vVel = particlesA.particles[index].vel;

  var cMass = vec2(0.0);

  var cVel = vec2(0.0);

  var colVel = vec2(0.0);

  var cMassCount = 0u;

  var cVelCount = 0u;

  var pos : vec2f;

  var vel : vec2f;

  for (var i = 0u; i < arrayLength(&particlesA.particles); i++) {

    if (i == index) {

      continue;

    }

    pos = particlesA.particles[i].pos.xy;

    vel = particlesA.particles[i].vel.xy;

    if (distance(pos, vPos) < params.rule1Distance) {

      cMass += pos;

      cMassCount++;

    }

    if (distance(pos, vPos) < params.rule2Distance) {

      colVel -= pos - vPos;

    }

    if (distance(pos, vPos) < params.rule3Distance) {

      cVel += vel;

      cVelCount++;

    }

  }

  if (cMassCount > 0) {

    cMass = (cMass / vec2(f32(cMassCount))) - vPos;

  }

  if (cVelCount > 0) {

    cVel /= f32(cVelCount);

  }

  vVel += (cMass * params.rule1Scale) + (colVel * params.rule2Scale) + (cVel * params.rule3Scale);

  // clamp velocity for a more pleasing simulation

  vVel = normalize(vVel) * clamp(length(vVel), 0.0, 0.1);

  // kinematic update

  vPos = vPos + (vVel * params.deltaT);

  // Wrap around boundary

  if (vPos.x < -1.0) {

    vPos.x = 1.0;

  }

  if (vPos.x > 1.0) {

    vPos.x = -1.0;

  }

  if (vPos.y < -1.0) {

    vPos.y = 1.0;

  }

  if (vPos.y > 1.0) {

    vPos.y = -1.0;

  }

  // Write back

  particlesB.particles[index].pos = vPos;

  particlesB.particles[index].vel = vVel;

}
```

Click to see the content

```

struct VertexOutput {

  @builtin(position) position : vec4f,

  @location(4) color : vec4f,

}

@vertex

fn vert_main(

  @location(0) a_particlePos : vec2f,

  @location(1) a_particleVel : vec2f,

  @location(2) a_pos : vec2f

) -> VertexOutput {

  let angle = -atan2(a_particleVel.x, a_particleVel.y);

  let pos = vec2(

    (a_pos.x * cos(angle)) - (a_pos.y * sin(angle)),

    (a_pos.x * sin(angle)) + (a_pos.y * cos(angle))

  );

  var output : VertexOutput;

  output.position = vec4(pos + a_particlePos, 0.0, 1.0);

  output.color = vec4(

    1.0 - sin(angle + 1.0) - a_particleVel.y,

    pos.x * 100.0 - a_particleVel.y + 0.1,

    a_particleVel.x + cos(angle + 0.5),

    1.0);

  return output;

}

@fragment

fn frag_main(@location(4) color : vec4f) -> @location(0) vec4f {

  return color;

}
```

If we wanted to leverage TypeGPU’s type-safe features with these shaders, we could
manually create the necessary definitions. However, maintaining these handcrafted
definitions in sync with the shaders can be both tedious and prone to errors.
Fortunately, we don’t have to do that; we can use the TypeGPU Generator CLI to automatically generate the required TypeScript definitions for us.

Assuming that we are inside the project directory (computeBoids folder), we can run the following command to generate the TypeScript definitions for the shaders:

```

tgpu-gen "shaders/*.wgsl" -o "definitions/*.ts"
```

This command will generate the following files:

- DirectorycomputeBoids


- Directoryshaders


- updateSprites.wgsl
- sprite.wgsl

- Directory
definitions


- updateSprites.ts

- sprite.ts


The generated TypeScript definitions look like this:

- [updateSprites.ts](https://docs.swmansion.com/TypeGPU/tooling/tgpu-gen/#tab-panel-11)
- [sprite.ts](https://docs.swmansion.com/TypeGPU/tooling/tgpu-gen/#tab-panel-12)

Click to see the content

```

/* generated via tgpu-gen by TypeGPU */

import tgpu from 'typegpu';

import * as d from 'typegpu/data';

/* structs */

export const Particle = d.struct({

  pos: d.vec2f,

  vel: d.vec2f,

});

export const SimParams = d.struct({

  deltaT: d.f32,

  rule1Distance: d.f32,

  rule2Distance: d.f32,

  rule3Distance: d.f32,

  rule1Scale: d.f32,

  rule2Scale: d.f32,

  rule3Scale: d.f32,

});

export const Particles = (arrayLength: number) => d.struct({

  particles: d.arrayOf(Particle, arrayLength),

});

/* bindGroupLayouts */

export const layout0 = tgpu.bindGroupLayout({

  params: {

    uniform: SimParams,

  },

  particlesA: {

    storage: Particles,

    access: 'readonly',

  },

  particlesB: {

    storage: Particles,

    access: 'mutable',

  },

});
```

Click to see the content

```

/* generated via tgpu-gen by TypeGPU */

import * as d from 'typegpu/data';

/* structs */

export const VertexOutput = d.struct({

  position: d.vec4f,

  color: d.vec4f,

});
```

These definitions can now be used in our TypeScript code to interact with the shaders in a type-safe manner.
If we wanted to tinker with the shaders, but still have the updated definitions, we could use the `--watch` flag to keep the definitions up-to-date.
For specific usage details, check out the following Usage section.

## Usage

This section will cover the most common use cases of the TypeGPU Generator CLI and provide short examples.

### Generate TypeGPU definitions for WGSL shader files

To generate TypeGPU definitions from a single WGSL shader file, run:

```

tgpu-gen path/to/shader.wgsl
```

This will generate a TypeScript file with the TypeGPU definitions in the same directory as the shader.
By default, the generated file will have the same name as the shader, with the `.ts` extension.

- Directorypath/to


- shader.wgsl
- shader.ts


TypeGPU Generator CLI supports glob patterns for specifying input paths.
The following command will generate TypeGPU definitions for all WGSL files inside a given directory:

```

tgpu-gen "path/to/*.wgsl"
```

The generated TypeScript files will have the same names as the shaders, with the `.ts` extension.

- Directorypath/to


- shader1.wgsl
- shader1.ts

- shader2.wgsl
- shader2.ts

- Directoryexample


- shader3.wgsl

To specify a recursive search, use the `**` pattern:

```

tgpu-gen "path/to/**/*.wgsl"
```

This will generate TypeGPU definitions for all WGSL files inside the `path/to` directory and its subdirectories.

- Directorypath/to


- shader1.wgsl
- shader1.ts

- Directoryexample


- shader2.wgsl
- shader2.ts


### Specify the output path with the `--output` option

By default, the generated TypeScript files are placed in the same directory as the input shaders.
You can specify a different output path using the `--output` option:

```

tgpu-gen "path/to/shader.wgsl" --output "different/path/output.ts"
```

This will generate the TypeGPU definitions in the `different/path` directory with the `output.ts` filename.

- Directorypath/to


- shader.wgsl

- Directory
different/path


- output.ts


It also supports glob patterns for specifying the output path:

```

tgpu-gen "path/to/*.wgsl" --output "output/*.ts"
```

This will generate the TypeGPU definitions in the `output` directory with the same names as the shaders, but with the `.ts` extension.

- Directorypath/to


- shader1.wgsl
- shader2.wgsl
- Directoryexample


- shader3.wgsl

- Directory
output


- shader1.ts

- shader2.ts


You can also use the `-o` shorthand for the `--output` option:

```

tgpu-gen "path/to/shader.wgsl" -o "different/path/output.ts"
```

### Supported extensions and module formats

By default, the generated TypeScript files use the `.ts` extension and the ES module format.
You can specify a different extension by just providing the extension in the output path:

```

tgpu-gen "path/to/shader.wgsl" -o "different/path/output.js"
```

This will generate the TypeGPU definitions in the `different/path` directory with the `output.js` filename.
The supported extensions are:

1

.js

2

.cjs

3

.mjs

4

.ts

5

.cts

6

.mts

### Using the `--keep` and `--overwrite` options

When generating TypeGPU definitions, if the output file already exists, the script will fail and not overwrite the existing file.
You can use the `--keep` option to skip the generation of the file if it already exists:

```

tgpu-gen "path/to/*.wgsl" --output "output/*.ts" --keep
```

This will skip the generation of the TypeGPU definitions for shaders that already have a corresponding TypeScript file in the output directory.

If you want to overwrite the existing files, you can use the `--overwrite` option:

```

tgpu-gen "path/to/*.wgsl" --output "output/*.ts" --overwrite
```

This will overwrite the existing TypeScript files with the new TypeGPU definitions.

### Watch mode

TypeGPU Generator CLI supports a watch mode that continuously monitors the input files for changes and updates the generated definitions.
To enable the watch mode, use the `--watch` (or `-w`) option:

```

tgpu-gen "path/to/*.wgsl" --output "output/*.ts" --watch
```

This will generate the TypeGPU definitions for all WGSL files inside the `path/to` directory
and its subdirectories and continuously monitor them for changes.
By default, the watch mode will overwrite the existing files when changes are detected after the initial generation.
You can also use the `--keep` and `--overwrite` options in the watch mode. They will only affect the initial generation.

## Getting help with the Generator CLI

To get a quick overview of the generator, its arguments and options, run:

```

tgpu-gen --help
```

You can also use the `-h` shorthand for the `--help` option.---
url: "https://docs.swmansion.com/TypeGPU/tooling/unplugin-typegpu/"
title: "Build Plugin | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/tooling/unplugin-typegpu/#_top)

# Build Plugin

[unplugin-typegpu](https://www.npmjs.com/package/unplugin-typegpu) is an optional (but highly recommended) tool for projects using TypeGPU. It hooks into your bundler of choice, and unlocks new features, optimizations and quality-of-life improvements.

The package includes the following functionalities:

- **TGSL functions**

TypeGPU allows running a subset of JavaScript (which we call TGSL) on the GPU. It is achieved by transpiling JS functions into WGSL.
This can be done via a Just-In-Time compiler or at build time, using the plugin.
Transpiling at build time reduces the performance overhead at runtime
and it is also the only possible approach on React Native, as the function code string is not available during runtime there.

_unplugin-typegpu_ scans the project files looking for the tgpu function shell implementations.
It transpiles the JS code into a compact AST format, called [tinyest](https://www.npmjs.com/package/tinyest).

When an implementation function is passed directly to the shell creation, the plugin should have no problem identifying and processing it.



```


import tgpu from 'typegpu';

import * as d from 'typegpu/data';




const add = tgpu['~unstable'].fn([d.u32, d.u32], d.u32)(

    (a, b) => a + b,

);
```









However, if the implementation function, or the shell, is referenced via a variable, the plugin will not recognize it as TGSL,
thus to make it work, the function needs to be marked with a `"kernel"` directive.



```


const addFn = tgpu['~unstable'].fn([d.u32, d.u32], d.u32);




const add = addFn((a, b) => {

    'kernel';

    return a + b;

});
```











```


const addImpl = (a, b) => {

    'kernel';

    return a + b;

};




const add = tgpu['~unstable'].fn([d.u32, d.u32], d.u32)(addImpl);
```









After transpiling the function, the JS implementation is removed from the bundle in order to save space.
To be able to invoke the function both on GPU and CPU, it needs to be marked with `"kernel & js"` directive;



```


const add = tgpu['~unstable'].fn([d.u32, d.u32], d.u32)((a, b) => {

    'kernel & js';

    return a + b;

});




add(2, 2);
```









Besides transpiling JS into AST, the plugin also collects external references, so it is not necessary to pass them to the `$uses` method anymore.
This is not possible when using a JIT transpiler.

- **\[WIP\] Automatic naming of tgpu objects**

Naming gpu objects via the `$name` method is very helpful for debugging. Soon it will not be necessary to do that explicitly.
Instead, the plugin will be able to name the objects based on the variable names that they are assigned to.


## Installation

- [npm](https://docs.swmansion.com/TypeGPU/tooling/unplugin-typegpu/#tab-panel-13)
- [pnpm](https://docs.swmansion.com/TypeGPU/tooling/unplugin-typegpu/#tab-panel-14)
- [yarn](https://docs.swmansion.com/TypeGPU/tooling/unplugin-typegpu/#tab-panel-15)

```

npm install --save-dev unplugin-typegpu
```

```

pnpm add -D unplugin-typegpu
```

```

yarn add -D unplugin-typegpu
```

After installing the package, the exported plugin needs to be included in the list of plugins in the bundler config.

## Supported bundlers

The plugin was built using [unplugin](https://unplugin.unjs.io/), which allows it to be used with a variety of bundlers.
Currently the package exports plugins for the following ones: _esbuild_, _farm_, _rolldown_, _rollup_, _rspack_, _vite_, _webpack_.
Apart from the tools supported by _unplugin_, a _babel_ plugin was also created.

- Vite

```

import { defineConfig } from 'vite';

import typegpuPlugin from 'unplugin-typegpu/vite';

export default defineConfig({

  plugins: [typegpuPlugin()],

});
```

- Babel (React Native)

```

module.exports = (api) => {

  api.cache(true);

  return {

    presets: ['babel-preset-expo'],

    plugins: ['unplugin-typegpu/babel'],

  };

};
```

## Plugin options

```

interface Options {

  include?: FilterPattern;

  exclude?: FilterPattern;

  enforce?: 'post' | 'pre' | undefined;

  forceTgpuAlias?: string;

}
```

The plugin accepts the standard `unplugin` options, that make it possible to customize which files are to be processed ( [include/exclude](https://rolldown.rs/guide/plugin-development#plugin-hook-filters) patterns),
or [enforce](https://vite.dev/guide/api-plugin.html#plugin-ordering) the order in which the plugin is run in regards to other plugins.

The custom _forceTgpuAlias_ option allows specifying the name of _tgpu_ object imported from `typegpu`.
It is only useful in a handful of custom scenarios, when the name cannot be retrieved by the plugin automatically from the import statement.

## Further reading

For more information about bundler plugins, please refer to the [unplugin](https://unplugin.unjs.io/guide/) and [babel](https://babeljs.io/docs/plugins) documentations.---
url: "https://docs.swmansion.com/TypeGPU/why-typegpu/"
title: "Why TypeGPU? | TypeGPU"
---

[Skip to content](https://docs.swmansion.com/TypeGPU/why-typegpu/#_top)

# Why TypeGPU?

TypeGPU is a project that aims to provide a type-safe abstraction over WebGPU, one that makes invalid states hard to represent but does not
restrict the developer’s intent where it counts.

## Our philosophy

Compared to use-case driven frameworks like [Three.js](https://threejs.org/) or [Babylon.js](https://www.babylonjs.com/), TypeGPU acts more like building blocks that can be put together into a framework, or used on their own to enhance existing solutions.
This enables the core library to be minimal, leaving use-case specific functionality to official and third-party modules.

The roadmap (as seen on the [landing page](https://docs.swmansion.com/TypeGPU)) covers our plans for bringing end-to-end type safety to WebGPU, seamlessly connecting JS/TS APIs with shaders that are also
written in JS/TS. If you find the need to eject out of an abstraction built on top of TypeGPU, you can still use our primitives, in contrast to having to use vanilla WebGPU or WebGL.

![Modularity](https://docs.swmansion.com/TypeGPU/_astro/modularity-dark.e1lUgwIn_1y9lY8.svg)![Modularity](https://docs.swmansion.com/TypeGPU/_astro/modularity-light.Bslvp0gp_1y9lY8.svg)

## Leaving WebGL behind

Even though WebGPU is a fairly new standard and is yet to be supported by all platforms, we are betting on it becoming the future of GPU computing on the web. Because of this, we can
provide a minimal abstraction that is more approachable and maintainable, yet still familiar to existing WebGPU developers.

## When to use TypeGPU?

Our library makes it easier and more reliable to implement custom behavior on the GPU thanks to our low-level typed primitives.
If you’re working on a GPU-accelerated simulation, a custom 3D renderer or AI inference of a proprietary model, TypeGPU can
help smooth out the development experience a lot.

If you’re looking to add an interactive 3d model to your website, then a rendering framework like [Three.js](https://threejs.org/) would be a safer bet.

## Projects using TypeGPU

- [Chaos Master](https://chaos-master.vercel.app/) by deluksic & Komediruzecki
- [Apollonian Circles](https://deluksic.github.io/apollonian-circles/) by
deluksic
- [Strange Forms](https://github.com/loganzartman/strangeforms) by Logan Zartman
- [WebGPU Stable Fluids](https://github.com/loganzartman/webgpu-stable-fluids)
by Logan Zartman
- [Visual timer: Calm Jar](https://apps.apple.com/us/app/visual-timer-calm-jar/id6741375962)
by Nathan Schmidt

## Frequently Asked Questions

🙋 Which browsers/platforms support TypeGPU?

TypeGPU can be used on any browser that supports WebGPU. The current coverage can be [checked here](https://caniuse.com/webgpu).
Additionally, thanks to [react-native-wgpu](https://github.com/wcandillon/react-native-webgpu), TypeGPU also works in React Native!

🙋 Can I use it in my React Native project?

Yes! Thanks to [react-native-wgpu](https://github.com/wcandillon/react-native-webgpu), TypeGPU also works in React Native.
[Read more about how to use it in your mobile app.](https://docs.swmansion.com/TypeGPU/integration/react-native/)