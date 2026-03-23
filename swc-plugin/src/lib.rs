use swc_core::ecma::{
    ast::*,
    visit::{VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

const MACRO_PACKAGE: &str = "jest-shallow-serializer/swc";

/// SWC plugin that transforms shallowMock calls to jest.mock calls.
///
/// Transforms:
/// ```typescript
/// import shallowMock from "jest-shallow-serializer/swc";
/// shallowMock("@/components/TestComponent", "TestComponent");
/// ```
///
/// Into:
/// ```typescript
/// jest.mock("@/components/TestComponent", shallowWrapper("@/components/TestComponent", "TestComponent"));
/// ```
pub struct TransformVisitor {
    /// Tracks local names imported from the macro package
    import_bindings: Vec<String>,
}

impl TransformVisitor {
    pub fn new() -> Self {
        Self {
            import_bindings: Vec::new(),
        }
    }
}

impl Default for TransformVisitor {
    fn default() -> Self {
        Self::new()
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_module(&mut self, module: &mut Module) {
        // First pass: collect import bindings from the macro package
        for item in &module.body {
            if let ModuleItem::ModuleDecl(ModuleDecl::Import(import)) = item {
                if import.src.value == MACRO_PACKAGE {
                    for specifier in &import.specifiers {
                        match specifier {
                            ImportSpecifier::Default(default_spec) => {
                                self.import_bindings
                                    .push(default_spec.local.sym.to_string());
                            }
                            ImportSpecifier::Named(named_spec) => {
                                self.import_bindings.push(named_spec.local.sym.to_string());
                            }
                            ImportSpecifier::Namespace(ns_spec) => {
                                self.import_bindings.push(ns_spec.local.sym.to_string());
                            }
                        }
                    }
                }
            }
        }

        // Second pass: visit children (which will transform calls and remove imports)
        module.visit_mut_children_with(self);
    }

    fn visit_mut_module_items(&mut self, items: &mut Vec<ModuleItem>) {
        // First, visit all items to transform calls
        for item in items.iter_mut() {
            item.visit_mut_children_with(self);
        }

        // Then, remove imports from the macro package
        items.retain(|item| {
            if let ModuleItem::ModuleDecl(ModuleDecl::Import(import)) = item {
                return import.src.value != MACRO_PACKAGE;
            }
            true
        });
    }

    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        // Check if this is a call to one of our tracked bindings
        if let Callee::Expr(expr) = &call.callee {
            if let Expr::Ident(ident) = expr.as_ref() {
                if self.import_bindings.contains(&ident.sym.to_string()) {
                    if call.args.is_empty() {
                        panic!("shallowMock requires a module path");
                    }

                    let module_path = call.args[0].expr.clone();
                    let component_names: Vec<ExprOrSpread> =
                        call.args[1..].iter().map(|arg| arg.clone()).collect();

                    // Build shallowWrapper call arguments
                    let mut sw_args = vec![ExprOrSpread {
                        spread: None,
                        expr: module_path.clone(),
                    }];
                    sw_args.extend(component_names);

                    // Create: jest.mock(modulePath, shallowWrapper(modulePath, ...componentNames))
                    let jest_mock_call = CallExpr {
                        span: call.span,
                        callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                            span: DUMMY_SP,
                            obj: Box::new(Expr::Ident(Ident::new(
                                "jest".into(),
                                DUMMY_SP,
                                SyntaxContext::empty(),
                            ))),
                            prop: MemberProp::Ident(IdentName::new("mock".into(), DUMMY_SP)),
                        }))),
                        args: vec![
                            ExprOrSpread {
                                spread: None,
                                expr: module_path,
                            },
                            ExprOrSpread {
                                spread: None,
                                expr: Box::new(Expr::Call(CallExpr {
                                    span: DUMMY_SP,
                                    callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                                        "shallowWrapper".into(),
                                        DUMMY_SP,
                                        SyntaxContext::empty(),
                                    )))),
                                    args: sw_args,
                                    type_args: None,
                                })),
                            },
                        ],
                        type_args: None,
                    };

                    *call = jest_mock_call;
                    return;
                }
            }
        }

        // Continue visiting children
        call.visit_mut_children_with(self);
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    let mut program = program;
    let mut visitor = TransformVisitor::new();
    program.visit_mut_with(&mut visitor);
    program
}
