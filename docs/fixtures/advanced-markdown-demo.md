# Demo Advanced Markdown

[[toc]]

## Links {#links}

[No protocol](example.com)
[Relative](/archive)
[Anchor](#links)
[Bad link - blocked](javascript:alert\(1\))

## Images

![Remote image](https://placehold.co/600x300 "Placeholder")

## Lists

- One
  - Two
    - Three

1. First
2. Second
   1. Nested

- [ ] Todo
- [x] Done

## Emoji

Ship it !100! !rocket!
Escaped: \!100!
Code: `!100!`

## Alerts

:::info
Informazione.
:::

:::warning Attenzione
Messaggio importante.
:::

> [!NOTE]
> Nota in stile GitHub.

## Code

```tsx title="components/Button.tsx" {2} lineNumbers color="purple"
export function Button() {
  return <button>Save</button>;
}
```

```diff
- old line removed
+ new line added
  unchanged line
```

## HTML strip

Raw HTML è ignorato per sicurezza:

`<script>alert('xss')</script>`

`<img src=x onerror=alert(1)>`
