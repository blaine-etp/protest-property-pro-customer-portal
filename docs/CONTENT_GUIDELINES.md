# Content Guidelines for County Pages

## HTML Content Entry

When entering or editing content for county pages, follow these guidelines to ensure proper formatting:

### ✅ DO:
- Use the rich text editor interface when possible
- Enter content as plain HTML without wrapping `<p>` tags around each element
- Use proper HTML structure: `<h1>`, `<h2>`, `<p>`, `<ul>`, `<li>`, etc.
- Test content display after saving

### ❌ DON'T:
- Wrap each HTML element in `<p>` tags (e.g., `<p><h1>Title</h1></p>`)
- Use HTML entities like `&lt;` and `&gt;` unless actually needed
- Copy/paste content that's already been HTML-encoded
- Add unnecessary wrapper elements like `<article>`

### Example of Correct Format:
```html
<h1>County Name Property Tax Information</h1>

<p>Welcome paragraph with introduction text.</p>

<h2>Section Heading</h2>

<p>Paragraph content explaining the section.</p>

<ul>
<li>List item 1</li>
<li>List item 2</li>
</ul>
```

### Example of Incorrect Format:
```html
<p>&lt;h1&gt;County Name Property Tax Information&lt;/h1&gt;</p>
<p>&lt;p&gt;Welcome paragraph&lt;/p&gt;</p>
<p>&lt;h2&gt;Section Heading&lt;/h2&gt;</p>
```

## Testing Your Content

After saving content changes:
1. View the county page on the frontend
2. Verify that headings appear as headings (not plain text)
3. Check that lists are properly formatted
4. Ensure links are clickable

If content appears as plain text instead of formatted HTML, the content may be double-encoded and needs to be cleaned up.