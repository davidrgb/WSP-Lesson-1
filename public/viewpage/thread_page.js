import * as Auth from '../controller/auth.js'
import * as Element from './element.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import {Reply} from '../model/reply.js'
import * as Route from '../controller/route.js'

export function addViewButtonListeners() {
    const viewButtonForms = document.getElementsByClassName("thread-view-form");
    for (let i = 0; i < viewButtonForms.length; i++) {
        addViewFormSubmitEvent(viewButtonForms[i]);
    }
}

export function addViewFormSubmitEvent(form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const threadId = e.target.threadId.value;
        history.pushState(null, null, Route.routePath.THREAD + '#' + threadId)
        thread_page(threadId);
    });
}

export async function thread_page(threadId) {
    if (!Auth.currentUser) {
        Element.root.innerHTML = '<h1>Protected Page</h1>'
        return
    }

    let thread
    let replies
    try {
        thread = await FirebaseController.getOneThread(threadId);
        if (!thread) {
            Util.info('Error', 'Thread does not exist');
            return;
        }
        replies = await FirebaseController.getReplyList(threadId);
        
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Util.info('Error', JSON.stringify(e));
        return;
    }

    let html = `
        <h4 class="bg-primary text-white">${thread.title}</h4>
        <div>${thread.email} (At ${new Date(thread.timestamp).toString()})</div>
        <div class="bg-secondary text-white">${thread.content}</div>
        <hr>
    `;

    html += '<div id="message-reply-body">'
    if (replies && replies.length > 0) {
        replies.forEach(r => {
            html += buildReplyView(r)
        });
    }
    html += '</div>'

    html += `
        <div>
            <textarea id="textarea-add-new-reply" placeholder="Reply to this thread"></textarea>
            <br>
            <button id="button-add-new-reply" class="btn btn-outline-info">Post reply</button>
        </div>
    `;

    Element.root.innerHTML = html;

    document.getElementById('button-add-new-reply').addEventListener('click', async () => {
        const content = document.getElementById('textarea-add-new-reply').value;
        const uid = Auth.currentUser.uid;
        const email = Auth.currentUser.email;
        const timestamp = Date.now();
        const reply = new Reply({
            uid, email, timestamp, content, threadId,
        });

        try {
            const docId = await FirebaseController.addReply(reply);
            reply.docId = docId;
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.info('Error', JSON.stringify(e))
        }

        const replyTag = document.createElement('div')
        replyTag.innerHTML = buildReplyView(reply)
        document.getElementById('message-reply-body').appendChild(replyTag)
        document.getElementById('textarea-add-new-reply').value = ''
    });
}

function buildReplyView(reply) {
    return `
        <div class="border border-primary">
            <div class="bg-info text-white">
                Replied by ${reply.email} (At ${new Date(reply.timestamp).toString()})
            </div>
            ${reply.content}
        </div>
        <hr>
    `;
}