export class Quotation {
  quoteIdentifier(identifier, forceQuotation) {
    return `"${identifier}"`;
  }

  quoteComment(comment) {
    return `'${comment}'`;
  }

  quoteLiteral(literal) {
    return `'${literal}'`;
  }
}
