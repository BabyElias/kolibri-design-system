<template>

  <DocsPageTemplate apiDocs>
    <DocsPageSection
      title="Overview"
      anchor="#overview"
    >
      <p>
        Creates a <code>&lt;button&gt;</code> tag and is appropriate for triggering javascript
        functions on-click. It can take on a number of visual styles, including both links and
        buttons.
      </p>
      <DocsShow>
        <p>
          <KButton
            text="Link"
            appearance="basic-link"
          />
        </p>
        <p>
          <KButton
            text="Link with icon"
            appearance="basic-link"
            icon="person"
          />
        </p>
      </DocsShow>
      <DocsShow>
        <KButtonGroup>
          <KButton
            text="Button"
            :primary="true"
            appearance="raised-button"
          />
          <KButton
            text="Flat button"
            :primary="true"
            appearance="flat-button"
          />
        </KButtonGroup>
      </DocsShow>
      <DocsShow>
        <KButtonGroup>
          <KButton
            text="Secondary button"
            :primary="false"
            appearance="raised-button"
          />
          <KButton
            text="Secondary flat button"
            :primary="false"
            appearance="flat-button"
          />
        </KButtonGroup>
      </DocsShow>
    </DocsPageSection>
    <DocsPageSection
      title="Related"
      anchor="#related"
    >
      <ul>
        <li>
          <DocsInternalLink
            text="Buttons and links"
            href="/buttons"
          />
          has an overview and usage guidance
        </li>
        <li>
          <DocsLibraryLink component="KExternalLink" /> and
          <DocsLibraryLink component="KRouterLink" /> are similar but handle events differently
        </li>
        <li><DocsLibraryLink component="KIconButton" /> has a tooltip instead of a text label</li>
        <li><DocsLibraryLink component="KButtonGroup" /> is used for button layout</li>
        <li>
          <DocsLibraryLink component="KDropdownMenu" /> and
          <DocsInternalLink
            text="Buttons and links"
            href="/buttons"
          />
          have more detail about adding a menu of options to a button component
        </li>
      </ul>
    </DocsPageSection>
  </DocsPageTemplate>

</template>
