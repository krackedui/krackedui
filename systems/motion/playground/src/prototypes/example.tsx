import { Button, Callout, rt, PageLayout, PageHeader, BlockRenderer, BlockContent } from '@krackedui/motion';

/** Example prototype: a simple Motion page. Open at #/proto/example. */
export default function Example() {
  return (
    <PageLayout header={<PageHeader icon="🧪" title="Prototype example" />}>
      <BlockContent>
        <Callout icon="💡" color="blue_background" text={rt('Prototypes live in app/src/prototypes and use only @krackedui/motion.')} />
      </BlockContent>
      <BlockRenderer blocks={[{ id: 'a', type: 'to_do', text: rt('Try the prototype-with-system skill') }]} />
      <div className="mt-4"><Button variant="primary">Looks like Motion</Button></div>
    </PageLayout>
  );
}
