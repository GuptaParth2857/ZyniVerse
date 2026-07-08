import "server-only";

export interface WidgetDef {
  id: string;
  name: string;
  description: string;
  type: "filler" | "dub" | "progress" | "recommendation" | "schedule" | "badge";
  width: number;
  height: number;
  script?: string;
  iframe?: string;
}

const WIDGETS_DATA: Record<string, Omit<WidgetDef, "id">> = {
  filler: {
    name: "Filler Guide Widget",
    description: "Show filler percentage and episode list for any anime",
    type: "filler",
    width: 300,
    height: 400,
    script: `<script src="https://zyniverse.app/widgets/filler.js" data-anime-id="{ID}" data-theme="dark"></script>`,
    iframe: `<iframe src="https://zyniverse.app/embed/filler/{ID}" width="300" height="400" frameborder="0"></iframe>`,
  },
  dub: {
    name: "Dub Status Badge",
    description: "Show Indian dub availability badge",
    type: "dub",
    width: 200,
    height: 60,
    script: `<script src="https://zyniverse.app/widgets/dub.js" data-mal-id="{ID}"></script>`,
    iframe: `<iframe src="https://zyniverse.app/embed/dub/{ID}" width="200" height="60" frameborder="0"></iframe>`,
  },
  progress: {
    name: "Watch Progress Widget",
    description: "Show your anime watch progress on your blog/site",
    type: "progress",
    width: 400,
    height: 300,
    script: `<script src="https://zyniverse.app/widgets/progress.js" data-user="{USERNAME}" data-theme="dark"></script>`,
    iframe: `<iframe src="https://zyniverse.app/embed/progress/{USERNAME}" width="400" height="300" frameborder="0"></iframe>`,
  },
  schedule: {
    name: "Airing Schedule Widget",
    description: "Show currently airing anime schedule",
    type: "schedule",
    width: 300,
    height: 500,
    iframe: `<iframe src="https://zyniverse.app/embed/schedule" width="300" height="500" frameborder="0"></iframe>`,
  },
  badge: {
    name: "ZyniVerse Badge",
    description: "Simple 'Powered by ZyniVerse' badge",
    type: "badge",
    width: 120,
    height: 30,
    iframe: `<iframe src="https://zyniverse.app/embed/badge" width="120" height="30" frameborder="0"></iframe>`,
  },
};

function buildWidget(id: string): WidgetDef {
  const base = WIDGETS_DATA[id];
  if (!base) throw new Error(`Unknown widget: ${id}`);
  return { id, ...base };
}

const WIDGETS: Record<string, WidgetDef> = {};
for (const key of Object.keys(WIDGETS_DATA)) {
  WIDGETS[key] = buildWidget(key);
}

export function getWidgetDef(id: string): WidgetDef | undefined {
  return WIDGETS[id];
}

export function generateEmbedScript(
  widgetId: string,
  params: Record<string, string>
): string {
  const def = getWidgetDef(widgetId);
  if (!def) throw new Error(`Unknown widget: ${widgetId}`);

  const entries = Object.entries(params);
  const script = def.script;
  const iframe = def.iframe;

  return JSON.stringify({
    script: script
      ? script.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`)
      : null,
    iframe: iframe
      ? iframe.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`)
      : null,
  });
}

export function getAllWidgets(): WidgetDef[] {
  return Object.values(WIDGETS);
}
