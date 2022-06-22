export type Sql = {
  <Row>(strings: TemplateStringsArray, ...values: any[]): {
    run(): Promise<void>;
    all(): Promise<Array<Row>>;
  };
};
