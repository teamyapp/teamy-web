export interface FeatureToggle {
    enableInsights: boolean;
    enablePlanningDoc: boolean;
    enableKnowledgeBase: boolean;
    enableMarketplace: boolean;
}

export function getFeatureToggle(): FeatureToggle {
    return {
        enableInsights: JSON.parse(import.meta.env.VITE_TOGGLE_ENABLE_INSIGHTS),
        enablePlanningDoc: JSON.parse(
            import.meta.env.VITE_TOGGLE_ENABLE_PLANNING_DOC,
        ),
        enableKnowledgeBase: JSON.parse(
            import.meta.env.VITE_TOGGLE_ENABLE_KNOWLEDGE_BASE,
        ),
        enableMarketplace: JSON.parse(
            import.meta.env.VITE_TOGGLE_ENABLE_MARKETPLACE,
        ),
    };
}
