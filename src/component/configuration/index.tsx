"use client";

import { useEffect, useMemo, useState } from "react";
import { useModal } from "@/context/ModalContext";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { Configuration } from "@/type/configuration";
import { MAX_FILTER } from "@/type/filter/BaseFilter";
import { editConfiguration, readConfiguration } from "@/service/configurationService";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseTable } from "@/type/common/ResponseTable";
import { ResponseApi } from "@/type/common/ResponseApi";
import ConfigurationList from "./ConfigurationList";
import ConfigurationEditForm from "./ConfigurationEditForm";
import ConfigurationFilter from "./ConfigurationFilter";
import { ConfigGroup, filterConfigurations } from "@/utils/configurationUtils";
import LoadingContent from "../ui/LoadingContent";
import { useContentLoading } from "@/hooks/useContentLoading";

export default function ConfigurationComponent() {
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching, withFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const [refetch, setRefetch] = useState<boolean>(false);
    const [configurations, setConfigurations] = useState<Configuration[]>([]);
    const [selected, setSelected] = useState<Configuration | null>(null);
    // The whole list is loaded once, so the filter works on it in the browser and answers at every keystroke.
    const [query, setQuery] = useState<string>("");
    const [group, setGroup] = useState<ConfigGroup | "all">("all");
    const visible: Configuration[] = useMemo(() => filterConfigurations(configurations, query, group), [configurations, query, group]);

    useEffect((): void => {
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readConfiguration(MAX_FILTER, setCsrf);
                const data: ResponseTable<Configuration[]> = await handleResponseTable<ResponseTable<Configuration[]>>(response);
                setConfigurations(data.data || []);
            });
        };
        fetchData();
    }, [refetch, withFetching, setCsrf]);

    const submitEdit = async (request: Configuration) => {
        const perfomEdit = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await editConfiguration(request, csrf, setCsrf);
                const data: ResponseApi<Configuration> = await handleResponseApi<ResponseApi<Configuration>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setSelected(null);
                    setRefetch(!refetch);
                    showModal(contentModalSuccess('Success update configuration'));
                } else {
                    showModal(contentModalError(`${data.message || 'Failed to update configuration.'}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Configuration edit confirmation</h3>
                <p className="mb-4">Are you sure you want to update this configuration?</p>
            </div>,
            async () => {
                await perfomEdit();
            },
            'Yes',
            'Cancel'
        );
    }

    // The editor opens under the row that was clicked. If a search or group hides that row meanwhile, it stays above the list.
    const editorVisibleInList: boolean = !!selected && visible.some((row: Configuration) => row.id === selected.id);
    const editor = selected && (
        <ConfigurationEditForm
            key={selected.id}
            selected={selected}
            submitEdit={submitEdit}
            onCancel={() => setSelected(null)}
        />
    );

    return (
        <div className="my-8">
            {selected && !editorVisibleInList && <div className="mb-4">{editor}</div>}

            {isFetching ? (
                <LoadingContent />
            ) : (
                <>
                    <ConfigurationFilter
                        query={query}
                        onQuery={setQuery}
                        group={group}
                        onGroup={setGroup}
                        shown={visible.length}
                        total={configurations.length}
                    />
                    <ConfigurationList
                        rows={visible}
                        onEdit={setSelected}
                        selectedId={editorVisibleInList ? selected?.id : undefined}
                        editor={editorVisibleInList ? editor : undefined}
                        filtered={query.trim() !== "" || group !== "all"}
                    />
                </>
            )}
        </div>
    );
}
