export interface FeatureToggle {
    enableInsights: boolean;
    enablePlanningDoc: boolean;
    enableKnowledgeBase: boolean;
    enableHelpCenter: boolean;
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
        enableHelpCenter: JSON.parse(
            import.meta.env.VITE_TOGGLE_ENABLE_HELP_CENTER,
        ),
        enableMarketplace: JSON.parse(
            import.meta.env.VITE_TOGGLE_ENABLE_MARKETPLACE,
        ),
    };
}
