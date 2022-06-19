export type Sql = <Row>(
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<Array<Row>>;
